from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.api.deps import get_current_user_id
from app.services import dataset_service
from app.services.dataset_service import DatasetValidationError

router = APIRouter(tags=["datasets"])


@router.get("/")
async def get_user_datasets(user_id: str = Depends(get_current_user_id)):
    """Fetch all datasets for the current user"""
    try:
        datasets = await dataset_service.list_user_datasets(user_id)
        return datasets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch datasets: {str(e)}"
        )


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload and validate a dataset file"""
    try:
        result = await dataset_service.upload_dataset(file, user_id)
        return result
    except DatasetValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset upload failed: {str(e)}"
        )


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a dataset (from Supabase DB and storage)"""
    try:
        # Fetch the dataset record first
        dataset = (
            dataset_service.supabase.table("datasets")
            .select("file_url, name")
            .eq("id", dataset_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not dataset.data:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Extract file path from URL
        file_name = dataset.data["name"]
        file_path = f"{user_id}/{file_name}"

        # Delete from Supabase storage
        storage_res = (
            dataset_service.supabase.storage.from_("datasets").remove([file_path])
        )
        if storage_res.get("error"):
            raise Exception(storage_res["error"].get("message", "Storage deletion failed"))

        # Delete from Supabase table
        db_res = (
            dataset_service.supabase.table("datasets")
            .delete()
            .eq("id", dataset_id)
            .eq("user_id", user_id)
            .execute()
        )

        if db_res.error:
            raise Exception("Failed to delete dataset metadata")

        return {"message": "Dataset deleted successfully", "dataset_id": dataset_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset deletion failed: {str(e)}"
        )
