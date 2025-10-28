# app/api/routes/train.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_current_user_id
from app.services.training_service import train_model, ModelTrainingError, analyze_target_column
from app.services.data_preprocessing import DataPreprocessingError
from app.services.dataset_service import list_user_datasets
from app.db.supabase_client import supabase

router = APIRouter()

@router.get("/{dataset_id}/analyze-target")
async def analyze_target(
        dataset_id: str,
        target_col: str = Query(..., description="Target column name"),
        user_id: str = Depends(get_current_user_id),
):
    """
    Analyze target column to determine appropriate problem type.
    Returns recommendations and warnings.
    """
    try:
        # Verify dataset exists and belongs to user
        dataset_check = (
            supabase.table("datasets")
            .select("id")
            .eq("id", dataset_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not dataset_check.data:
            raise HTTPException(
                status_code=404,
                detail="Dataset not found or does not belong to user"
            )

        # Analyze target column
        analysis = await analyze_target_column(dataset_id, user_id, target_col)

        return {
            "status": "success",
            "data": analysis,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )



@router.post("/{dataset_id}")
async def train_user_dataset(
        dataset_id: str,
        target_col: str = Query(..., description="Target column name"),
        model_type: str = Query("auto", description="Model type or 'auto'"),
        problem_type: str = Query("auto", description="Problem type or 'auto'"),
        test_size: float = Query(0.2, ge=0.1, le=0.5, description="Test set proportion"),
        use_polynomial: bool = Query(False, description="Use polynomial features"),
        polynomial_degree: int = Query(2, ge=2, le=5, description="Polynomial degree"),
        use_target_encoder: bool = Query(False, description="Use target encoding"),
        user_id: str = Depends(get_current_user_id),
):
    """
    Train a model on a given dataset.
    Automatically preprocesses, trains, saves model, and returns metrics.

    Args:
        dataset_id (str): The dataset ID to train on
        target_col (str): Target column name
        model_type (str): Model name (e.g. 'linear_regression', 'random_forest', or 'auto')
        problem_type (str): 'classification', 'regression', or 'auto'
        test_size (float): Proportion of data for test split
        use_polynomial (bool): Whether to use polynomial features
        polynomial_degree (int): Degree of polynomial expansion
        use_target_encoder (bool): Use target encoding for high-cardinality categoricals
    """
    try:
        # Verify dataset exists and belongs to user
        dataset_check = (
            supabase.table("datasets")
            .select("id")
            .eq("id", dataset_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not dataset_check.data:
            raise HTTPException(
                status_code=404,
                detail="Dataset not found or does not belong to user"
            )

        # Trigger model training pipeline
        result = await train_model(
            dataset_id=dataset_id,
            user_id=user_id,
            target_col=target_col,
            model_type=model_type,
            problem_type=problem_type,
            test_size=test_size,
            use_polynomial=use_polynomial,
            polynomial_degree=polynomial_degree,
            use_target_encoder=use_target_encoder,
        )

        return {
            "status": "success",
            "message": "Model trained successfully",
            "data": result,
        }

    except DataPreprocessingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Preprocessing error: {str(e)}"
        )
    except ModelTrainingError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )