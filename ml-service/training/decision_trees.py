"""
Transparent, Modular ID3 and C4.5 Decision Tree Implementations.
Implements:
1. Shannon Entropy
2. Information Gain (ID3)
3. Split Information (Intrinsic Value)
4. Gain Ratio (C4.5)
5. Explainable Decision Path Extraction
"""

import math
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np


class DecisionTreeNode:
    def __init__(
        self,
        attribute: Optional[str] = None,
        branches: Optional[Dict[str, "DecisionTreeNode"]] = None,
        prediction: Optional[Any] = None,
        entropy: float = 0.0,
        gain: float = 0.0,
        gain_ratio: float = 0.0,
        sample_count: int = 0,
        class_distribution: Optional[Dict[Any, int]] = None,
        is_leaf: bool = False,
        depth: int = 0
    ):
        self.attribute = attribute
        self.branches = branches or {}
        self.prediction = prediction
        self.entropy = entropy
        self.gain = gain
        self.gain_ratio = gain_ratio
        self.sample_count = sample_count
        self.class_distribution = class_distribution or {}
        self.is_leaf = is_leaf
        self.depth = depth

    def to_dict(self) -> Dict[str, Any]:
        """Serializes tree structure to a human-readable dictionary with standard JSON types."""
        clean_dist = {str(k): int(v) for k, v in self.class_distribution.items()}
        pred = int(self.prediction) if isinstance(self.prediction, (int, np.integer)) else self.prediction

        if self.is_leaf:
            return {
                "is_leaf": True,
                "prediction": pred,
                "sample_count": int(self.sample_count),
                "class_distribution": clean_dist,
                "entropy": round(float(self.entropy), 4),
                "depth": int(self.depth)
            }
        return {
            "is_leaf": False,
            "split_attribute": str(self.attribute),
            "sample_count": int(self.sample_count),
            "entropy": round(float(self.entropy), 4),
            "gain": round(float(self.gain), 4),
            "gain_ratio": round(float(self.gain_ratio), 4),
            "depth": int(self.depth),
            "branches": {str(k): v.to_dict() for k, v in self.branches.items()}
        }


class BaseCustomDecisionTree:
    def __init__(self, max_depth: int = 6, min_samples_split: int = 2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root: Optional[DecisionTreeNode] = None
        self.classes_: List[Any] = []
        self.feature_names_: List[str] = []

    @staticmethod
    def calculate_entropy(y: pd.Series) -> float:
        """
        Computes Shannon Entropy: H(S) = - sum(p_i * log2(p_i))
        """
        if len(y) == 0:
            return 0.0
        counts = y.value_counts()
        probabilities = counts / len(y)
        entropy = 0.0
        for p in probabilities:
            if p > 0:
                entropy -= p * math.log2(p)
        return float(entropy)

    @staticmethod
    def calculate_information_gain(X_col: pd.Series, y: pd.Series, base_entropy: float) -> Tuple[float, float]:
        """
        Calculates Information Gain and Split Information for an attribute.
        Gain(S, A) = H(S) - sum(|S_v| / |S| * H(S_v))
        SplitInfo_A(S) = - sum(|S_v| / |S| * log2(|S_v| / |S|))
        """
        n = len(y)
        if n == 0:
            return 0.0, 0.0

        weighted_entropy = 0.0
        split_info = 0.0

        for val, group_idx in X_col.groupby(X_col).groups.items():
            sub_y = y.loc[group_idx]
            sub_len = len(sub_y)
            if sub_len == 0:
                continue
            weight = sub_len / n
            weighted_entropy += weight * BaseCustomDecisionTree.calculate_entropy(sub_y)
            if weight > 0:
                split_info -= weight * math.log2(weight)

        gain = base_entropy - weighted_entropy
        return float(gain), float(split_info)

    def predict_single(self, row: Dict[str, Any]) -> Tuple[Any, List[str]]:
        """
        Traverses tree for a single row and returns prediction + explanation path.
        """
        if self.root is None:
            raise ValueError("Model is not fitted yet.")

        current = self.root
        path_explanations = []

        while not current.is_leaf:
            attr = current.attribute
            val = str(row.get(attr, "UNKNOWN"))
            if val in current.branches:
                path_explanations.append(f"Attribute '{attr}' is '{val}' (Node entropy: {round(current.entropy, 3)})")
                current = current.branches[val]
            else:
                # Handle unseen category: fallback to majority class in current node
                majority_class = max(current.class_distribution.items(), key=lambda x: x[1])[0]
                path_explanations.append(f"Attribute '{attr}' has unseen value '{val}', defaulted to dominant branch class '{majority_class}'")
                return majority_class, path_explanations

        path_explanations.append(f"Reached leaf node with recommended discount '{current.prediction}' (Confidence: {current.sample_count} samples)")
        return current.prediction, path_explanations

    def predict(self, X: pd.DataFrame) -> List[Any]:
        preds = []
        for _, row in X.iterrows():
            pred, _ = self.predict_single(row.to_dict())
            preds.append(pred)
        return preds


class ID3DecisionTreeClassifier(BaseCustomDecisionTree):
    """
    ID3 Algorithm: Chooses splits based purely on maximum Information Gain.
    """
    def __init__(self, max_depth: int = 5, min_samples_split: int = 2):
        super().__init__(max_depth=max_depth, min_samples_split=min_samples_split)
        self.algorithm_name = "ID3"

    def fit(self, X: pd.DataFrame, y: pd.Series):
        self.feature_names_ = list(X.columns)
        self.classes_ = sorted(list(y.unique()))
        self.root = self._build_tree(X, y, available_features=self.feature_names_.copy(), depth=0)
        return self

    def _build_tree(self, X: pd.DataFrame, y: pd.Series, available_features: List[str], depth: int) -> DecisionTreeNode:
        class_dist = dict(y.value_counts())
        majority_class = max(class_dist.items(), key=lambda item: item[1])[0] if len(y) > 0 else 0
        node_entropy = self.calculate_entropy(y)

        # Base case 1: Pure node
        if len(class_dist) <= 1 or node_entropy == 0.0:
            return DecisionTreeNode(
                prediction=majority_class,
                entropy=node_entropy,
                sample_count=len(y),
                class_distribution=class_dist,
                is_leaf=True,
                depth=depth
            )

        # Base case 2: Max depth or minimum samples reached or no features left
        if depth >= self.max_depth or len(y) < self.min_samples_split or not available_features:
            return DecisionTreeNode(
                prediction=majority_class,
                entropy=node_entropy,
                sample_count=len(y),
                class_distribution=class_dist,
                is_leaf=True,
                depth=depth
            )

        # Evaluate Information Gain for each attribute
        best_gain = -1.0
        best_attr = None

        for attr in available_features:
            gain, _ = self.calculate_information_gain(X[attr], y, node_entropy)
            if gain > best_gain:
                best_gain = gain
                best_attr = attr

        if best_gain <= 1e-6 or best_attr is None:
            return DecisionTreeNode(
                prediction=majority_class,
                entropy=node_entropy,
                sample_count=len(y),
                class_distribution=class_dist,
                is_leaf=True,
                depth=depth
            )

        # Split on best_attr
        branches = {}
        remaining_features = [f for f in available_features if f != best_attr]

        for val, group_idx in X[best_attr].groupby(X[best_attr]).groups.items():
            sub_X = X.loc[group_idx]
            sub_y = y.loc[group_idx]
            branches[str(val)] = self._build_tree(sub_X, sub_y, remaining_features, depth + 1)

        return DecisionTreeNode(
            attribute=best_attr,
            branches=branches,
            entropy=node_entropy,
            gain=best_gain,
            sample_count=len(y),
            class_distribution=class_dist,
            is_leaf=False,
            depth=depth
        )


class C45DecisionTreeClassifier(BaseCustomDecisionTree):
    """
    C4.5 Algorithm: Normalizes Information Gain by Split Information to compute Gain Ratio,
    preventing bias toward multi-valued attributes.
    """
    def __init__(self, max_depth: int = 5, min_samples_split: int = 2):
        super().__init__(max_depth=max_depth, min_samples_split=min_samples_split)
        self.algorithm_name = "C4.5"

    def fit(self, X: pd.DataFrame, y: pd.Series):
        self.feature_names_ = list(X.columns)
        self.classes_ = sorted(list(y.unique()))
        self.root = self._build_tree(X, y, available_features=self.feature_names_.copy(), depth=0)
        return self

    def _build_tree(self, X: pd.DataFrame, y: pd.Series, available_features: List[str], depth: int) -> DecisionTreeNode:
        class_dist = dict(y.value_counts())
        majority_class = max(class_dist.items(), key=lambda item: item[1])[0] if len(y) > 0 else 0
        node_entropy = self.calculate_entropy(y)

        if len(class_dist) <= 1 or node_entropy == 0.0:
            return DecisionTreeNode(
                prediction=majority_class,
                entropy=node_entropy,
                sample_count=len(y),
                class_distribution=class_dist,
                is_leaf=True,
                depth=depth
            )

        if depth >= self.max_depth or len(y) < self.min_samples_split or not available_features:
            return DecisionTreeNode(
                prediction=majority_class,
                entropy=node_entropy,
                sample_count=len(y),
                class_distribution=class_dist,
                is_leaf=True,
                depth=depth
            )

        best_gain_ratio = -1.0
        best_gain = 0.0
        best_attr = None

        for attr in available_features:
            gain, split_info = self.calculate_information_gain(X[attr], y, node_entropy)
            # Gain Ratio = Gain / (SplitInfo + epsilon)
            gain_ratio = gain / (split_info + 1e-9) if split_info > 0 else 0.0

            if gain_ratio > best_gain_ratio and gain > 1e-6:
                best_gain_ratio = gain_ratio
                best_gain = gain
                best_attr = attr

        if best_gain_ratio <= 1e-6 or best_attr is None:
            return DecisionTreeNode(
                prediction=majority_class,
                entropy=node_entropy,
                sample_count=len(y),
                class_distribution=class_dist,
                is_leaf=True,
                depth=depth
            )

        branches = {}
        remaining_features = [f for f in available_features if f != best_attr]

        for val, group_idx in X[best_attr].groupby(X[best_attr]).groups.items():
            sub_X = X.loc[group_idx]
            sub_y = y.loc[group_idx]
            branches[str(val)] = self._build_tree(sub_X, sub_y, remaining_features, depth + 1)

        return DecisionTreeNode(
            attribute=best_attr,
            branches=branches,
            entropy=node_entropy,
            gain=best_gain,
            gain_ratio=best_gain_ratio,
            sample_count=len(y),
            class_distribution=class_dist,
            is_leaf=False,
            depth=depth
        )
