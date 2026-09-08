"""
Time Series Preprocessing Module for Demand Forecasting.
Fills missing calendar dates, imputes zero-demand on inactive days,
and formats chronological Series for ARIMA and Holt-Winters models.
"""

from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np


class TimeSeriesPreprocessor:
    def __init__(self, date_col: str = "date", target_col: str = "unitsSold"):
        self.date_col = date_col
        self.target_col = target_col

    def prepare_daily_series(self, raw_data: List[Dict[str, Any]]) -> pd.Series:
        """
        Converts raw chronological order items into a continuous daily Pandas Series.
        Fills missing calendar days with 0 demand.
        """
        if not raw_data:
            return pd.Series(dtype=float)

        df = pd.DataFrame(raw_data)
        if self.date_col not in df.columns or self.target_col not in df.columns:
            raise KeyError(f"Expected '{self.date_col}' and '{self.target_col}' in time series data.")

        df[self.date_col] = pd.to_datetime(df[self.date_col])
        df[self.target_col] = pd.to_numeric(df[self.target_col], errors="coerce").fillna(0.0)

        # Aggregate multiple transactions on the same day
        daily_df = df.groupby(self.date_col)[self.target_col].sum().reset_index()
        daily_df = daily_df.sort_values(self.date_col)

        # Create full continuous date range
        min_date = daily_df[self.date_col].min()
        max_date = daily_df[self.date_col].max()
        full_range = pd.date_range(start=min_date, end=max_date, freq="D")

        daily_df = daily_df.set_index(self.date_col).reindex(full_range, fill_value=0.0)
        daily_df.index.name = "date"
        series = daily_df[self.target_col].asfreq("D", fill_value=0.0)
        return series

    def train_test_split(self, series: pd.Series, test_size: int = 14) -> Tuple[pd.Series, pd.Series]:
        """
        Splits a time series into train and test windows chronologically without data leakage.
        """
        if len(series) <= test_size + 7:
            # If historical window is small, use 80/20 chronological split
            split_idx = int(len(series) * 0.8)
            return series.iloc[:split_idx], series.iloc[split_idx:]
        return series.iloc[:-test_size], series.iloc[-test_size:]
