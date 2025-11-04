# app/utils/safe_label_encoding.py
"""
Safe label encoding utilities to handle unseen labels gracefully
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from typing import Tuple, Optional, List, Dict, Any
import warnings


class SafeLabelEncoder:
    """
    A wrapper around sklearn's LabelEncoder that handles unseen labels gracefully.

    Features:
    - Tracks unseen labels during transform
    - Maps unseen labels to a special value or the most common class
    - Logs warnings when unseen labels are encountered
    - Provides detailed statistics about label mapping
    """

    def __init__(self, handle_unknown: str = 'use_encoded_value', unknown_value: Optional[int] = None):
        """
        Args:
            handle_unknown: Strategy for handling unseen labels
                - 'use_encoded_value': Map to unknown_value (default: -1)
                - 'use_mode': Map to most common class from training
                - 'error': Raise ValueError (original sklearn behavior)
            unknown_value: Value to use for unseen labels (only for 'use_encoded_value')
        """
        self.encoder = LabelEncoder()
        self.handle_unknown = handle_unknown
        self.unknown_value = unknown_value if unknown_value is not None else -1
        self.classes_ = None
        self.mode_class_ = None
        self.unseen_labels_ = []
        self.mapping_stats_ = {}

    def fit(self, y):
        """Fit label encoder and store metadata."""
        y_array = np.asarray(y).ravel()

        # Remove NaN values before fitting
        y_clean = y_array[~pd.isna(y_array)]

        if len(y_clean) == 0:
            raise ValueError("Cannot fit SafeLabelEncoder with all NaN values")

        self.encoder.fit(y_clean)
        self.classes_ = self.encoder.classes_

        # FIX: Store most common class for fallback
        unique, counts = np.unique(y_clean, return_counts=True)
        self.mode_class_ = unique[np.argmax(counts)]

        # Initialize stats
        self.mapping_stats_ = {
            'n_classes': len(self.classes_),
            'classes': self.classes_.tolist(),
            'mode_class': self.mode_class_,
            'unseen_encountered': False,
            'unseen_count': 0,
            'unseen_labels': []
        }

        return self

    def transform(self, y) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Transform labels, handling unseen values gracefully.

        Returns:
            Tuple of (encoded_labels, stats_dict)
        """
        if self.classes_ is None:
            raise ValueError("SafeLabelEncoder must be fitted before transform")

        y_array = np.asarray(y).ravel()
        encoded = np.zeros(len(y_array), dtype=int)
        unseen_mask = np.zeros(len(y_array), dtype=bool)
        unseen_labels = []

        # FIX: Handle each element individually to catch unseen labels
        for i, label in enumerate(y_array):
            # Handle NaN
            if pd.isna(label):
                if self.handle_unknown == 'error':
                    raise ValueError(f"NaN value encountered at index {i}")
                encoded[i] = self.unknown_value
                unseen_mask[i] = True
                continue

            # Check if label was seen during training
            if label not in self.classes_:
                unseen_mask[i] = True
                unseen_labels.append(label)

                if self.handle_unknown == 'error':
                    raise ValueError(
                        f"Label '{label}' not seen during training. "
                        f"Known labels: {self.classes_}"
                    )
                elif self.handle_unknown == 'use_mode':
                    # Map to most common class
                    encoded[i] = self.encoder.transform([self.mode_class_])[0]
                else:  # use_encoded_value
                    encoded[i] = self.unknown_value
            else:
                # Normal encoding
                encoded[i] = self.encoder.transform([label])[0]

        # FIX: Log and store unseen label statistics
        if unseen_mask.any():
            unique_unseen = np.unique([l for l in unseen_labels if not pd.isna(l)])
            self.unseen_labels_.extend(unique_unseen.tolist())

            warning_msg = (
                f"WARNING: {unseen_mask.sum()} unseen labels encountered during transform. "
                f"Unique unseen labels: {unique_unseen.tolist()[:10]}... "
                f"Strategy: {self.handle_unknown}"
            )
            warnings.warn(warning_msg, UserWarning)
            print(f"[SafeLabelEncoder] {warning_msg}")

        # Update statistics
        transform_stats = {
            'total_samples': len(y_array),
            'unseen_count': int(unseen_mask.sum()),
            'unseen_labels': unique_unseen.tolist() if unseen_mask.any() else [],
            'unseen_percentage': float(unseen_mask.sum() / len(y_array) * 100),
            'strategy_used': self.handle_unknown
        }

        return encoded, transform_stats

    def fit_transform(self, y) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Fit and transform in one step."""
        self.fit(y)
        return self.transform(y)

    def inverse_transform(self, y):
        """
        Inverse transform encoded labels back to original labels.
        Handles unknown_value gracefully.
        """
        y_array = np.asarray(y).ravel()

        # FIX: Handle unknown values in inverse transform
        decoded = np.empty(len(y_array), dtype=object)
        for i, encoded_val in enumerate(y_array):
            if encoded_val == self.unknown_value:
                decoded[i] = f"<UNKNOWN_{self.unknown_value}>"
            elif encoded_val < 0 or encoded_val >= len(self.classes_):
                decoded[i] = f"<INVALID_{encoded_val}>"
            else:
                decoded[i] = self.classes_[encoded_val]

        return decoded

    def get_stats(self) -> Dict[str, Any]:
        """Return comprehensive statistics about label encoding."""
        return {
            **self.mapping_stats_,
            'unseen_encountered': len(self.unseen_labels_) > 0,
            'total_unseen_labels': len(self.unseen_labels_),
            'all_unseen_labels': self.unseen_labels_
        }


def safe_encode_labels(
        y_train,
        y_test,
        handle_unknown: str = 'use_mode'
) -> Tuple[np.ndarray, np.ndarray, SafeLabelEncoder, Dict[str, Any]]:
    """
    Convenience function to safely encode train and test labels.

    Args:
        y_train: Training labels
        y_test: Test labels
        handle_unknown: How to handle unseen labels in test set

    Returns:
        Tuple of (y_train_encoded, y_test_encoded, encoder, stats)
    """
    encoder = SafeLabelEncoder(handle_unknown=handle_unknown)

    # Fit on training data only
    y_train_encoded, train_stats = encoder.fit_transform(y_train)

    # Transform test data (may contain unseen labels)
    y_test_encoded, test_stats = encoder.transform(y_test)

    # Combine statistics
    combined_stats = {
        'train': train_stats,
        'test': test_stats,
        'encoder_info': encoder.get_stats()
    }

    # FIX: Log summary
    print(f"\n[Label Encoding Summary]")
    print(f"  Training set: {len(y_train)} samples, {len(encoder.classes_)} unique classes")
    print(f"  Test set: {len(y_test)} samples")
    if test_stats['unseen_count'] > 0:
        print(
            f"  ⚠️  Test set contains {test_stats['unseen_count']} unseen labels ({test_stats['unseen_percentage']:.2f}%)")
        print(f"  Strategy: Mapping to {handle_unknown}")
        print(f"  Unseen labels: {test_stats['unseen_labels'][:10]}")
    else:
        print(f"  ✅ No unseen labels in test set")
    print()

    return y_train_encoded, y_test_encoded, encoder, combined_stats


def validate_label_distribution(y_train, y_test, min_samples_per_class: int = 2) -> Dict[str, Any]:
    """
    Validate that label distribution is suitable for training.

    Returns validation report with warnings.
    """
    y_train_array = np.asarray(y_train).ravel()
    y_test_array = np.asarray(y_test).ravel()

    # Get class distributions
    train_unique, train_counts = np.unique(y_train_array, return_counts=True)
    test_unique, test_counts = np.unique(y_test_array, return_counts=True)

    # Find issues
    issues = []
    warnings_list = []

    # Check for classes with too few samples
    sparse_classes = train_unique[train_counts < min_samples_per_class]
    if len(sparse_classes) > 0:
        issues.append({
            'type': 'sparse_classes',
            'severity': 'warning',
            'message': f"{len(sparse_classes)} classes have fewer than {min_samples_per_class} samples",
            'details': {cls: int(count) for cls, count in zip(train_unique, train_counts) if
                        count < min_samples_per_class}
        })

    # Check for unseen test classes
    unseen_in_test = set(test_unique) - set(train_unique)
    if unseen_in_test:
        issues.append({
            'type': 'unseen_test_labels',
            'severity': 'error',
            'message': f"Test set contains {len(unseen_in_test)} labels not in training set",
            'details': list(unseen_in_test)[:10]
        })

    # Check for extreme imbalance
    if len(train_counts) > 1:
        imbalance_ratio = train_counts.max() / train_counts.min()
        if imbalance_ratio > 50:
            issues.append({
                'type': 'class_imbalance',
                'severity': 'warning',
                'message': f"Severe class imbalance detected (ratio: {imbalance_ratio:.1f}:1)",
                'details': {
                    'max_class': str(train_unique[train_counts.argmax()]),
                    'max_count': int(train_counts.max()),
                    'min_class': str(train_unique[train_counts.argmin()]),
                    'min_count': int(train_counts.min())
                }
            })

    return {
        'valid': len([i for i in issues if i['severity'] == 'error']) == 0,
        'issues': issues,
        'train_distribution': {str(k): int(v) for k, v in zip(train_unique, train_counts)},
        'test_distribution': {str(k): int(v) for k, v in zip(test_unique, test_counts)},
        'n_train_classes': len(train_unique),
        'n_test_classes': len(test_unique)
    }