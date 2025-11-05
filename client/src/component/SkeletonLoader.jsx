import React from "react";
import "./SkeletonLoader.css";

export const SkeletonItem = () => {
  return (
    <li className="skeleton-item">
      <div className="skeleton skeleton-handle"></div>
      <div className="skeleton skeleton-checkbox"></div>
      <div className="skeleton skeleton-text skeleton-name"></div>
      <div className="skeleton skeleton-text skeleton-quantity"></div>
      <div className="skeleton skeleton-text skeleton-assigned"></div>
      <div className="skeleton-actions">
        <div className="skeleton skeleton-icon"></div>
        <div className="skeleton skeleton-icon"></div>
      </div>
    </li>
  );
};

export const SkeletonItemList = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </>
  );
};

export const SkeletonActivity = () => {
  return (
    <li className="skeleton-activity">
      <div className="skeleton skeleton-avatar"></div>
      <div className="skeleton-activity-content">
        <div className="skeleton skeleton-text skeleton-activity-text"></div>
        <div className="skeleton skeleton-text skeleton-activity-time"></div>
      </div>
    </li>
  );
};

export const SkeletonActivityList = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonActivity key={index} />
      ))}
    </>
  );
};
