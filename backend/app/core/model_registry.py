# app/core/model_registry.py
from sklearn.linear_model import LinearRegression, Ridge, Lasso, LogisticRegression
from sklearn.svm import SVR, SVC
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier

MODEL_REGISTRY = {
    "regression": {
        "linear_regression": LinearRegression,
        "ridge": Ridge,
        "lasso": Lasso,
        "svr": SVR,
        "random_forest": RandomForestRegressor,
        "gradient_boosting": GradientBoostingRegressor,
        "decision_tree": DecisionTreeRegressor,
        "knn": KNeighborsRegressor,
    },
    "classification": {
        "logistic_regression": LogisticRegression,
        "svc": SVC,
        "random_forest": RandomForestClassifier,
        "gradient_boosting": GradientBoostingClassifier,
        "decision_tree": DecisionTreeClassifier,
        "knn": KNeighborsClassifier,
    }
}

def get_model(problem_type: str, model_type: str):
    try:
        return MODEL_REGISTRY[problem_type][model_type]
    except KeyError:
        raise ValueError(f"Unknown model type '{model_type}' for problem '{problem_type}'.")
