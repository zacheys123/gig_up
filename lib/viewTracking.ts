// utils/viewTracking.ts
export interface ViewRecord {
  videoId: string;
  userId: string;
  timestamp: number;
  viewCount: number; // Track how many times they've viewed (for analytics)
}

export class ViewTracker {
  private static readonly STORAGE_KEY = "video_views";
  private static readonly MAX_VIEWS_PER_SESSION = 3; // Max views per video per session
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static hasViewedRecently(videoId: string, userId: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      const views = this.getUserViews();
      const userVideoViews = views.filter(
        (view) => view.videoId === videoId && view.userId === userId
      );

      if (userVideoViews.length === 0) return false;

      // Check if any view is within the session duration
      const now = Date.now();
      const recentViews = userVideoViews.filter(
        (view) => now - view.timestamp < this.SESSION_DURATION
      );

      // If user has viewed more than max allowed times in current session
      const totalRecentViews = recentViews.reduce(
        (sum, view) => sum + view.viewCount,
        0
      );
      return totalRecentViews >= this.MAX_VIEWS_PER_SESSION;
    } catch (error) {
      console.error("Error checking view history:", error);
      return false;
    }
  }

  static shouldRecordView(videoId: string, userId: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      const views = this.getUserViews();
      const now = Date.now();

      // Filter recent views for this video and user
      const recentViews = views.filter(
        (view) =>
          view.videoId === videoId &&
          view.userId === userId &&
          now - view.timestamp < this.SESSION_DURATION
      );

      const totalRecentViews = recentViews.reduce(
        (sum, view) => sum + view.viewCount,
        0
      );

      // Return true if user CAN view (hasn't exceeded limit)
      return totalRecentViews < this.MAX_VIEWS_PER_SESSION;
    } catch (error) {
      console.error("Error checking view eligibility:", error);
      return true; // Allow view on error
    }
  }
  static recordView(videoId: string, userId: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      // Check if user SHOULD be allowed to view
      if (!this.shouldRecordView(videoId, userId)) {
        console.log("View blocked: User has exceeded view limit");
        return false;
      }

      const views = this.getUserViews();
      const now = Date.now();

      // Find existing view record for this user and video
      const existingViewIndex = views.findIndex(
        (view) => view.videoId === videoId && view.userId === userId
      );

      if (existingViewIndex !== -1) {
        // Update existing view
        const existingView = views[existingViewIndex];

        // Check if it's a new session (more than 1 hour since last view)
        const isNewSession = now - existingView.timestamp > 60 * 60 * 1000;

        if (isNewSession) {
          // Reset view count for new session
          views[existingViewIndex] = {
            ...existingView,
            timestamp: now,
            viewCount: 1,
          };
        } else {
          // Increment view count in current session
          views[existingViewIndex] = {
            ...existingView,
            timestamp: now,
            viewCount: existingView.viewCount + 1,
          };
        }
      } else {
        // Create new view record
        views.push({
          videoId,
          userId,
          timestamp: now,
          viewCount: 1,
        });
      }

      // Clean up old records (older than 7 days)
      const cleanedViews = views.filter(
        (view) => now - view.timestamp < 7 * 24 * 60 * 60 * 1000
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedViews));
      return true;
    } catch (error) {
      console.error("Error recording view:", error);
      return false;
    }
  }

  static getUserViews(): ViewRecord[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading view history:", error);
      return [];
    }
  }

  static clearUserViews(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing view history:", error);
    }
  }

  static getUserViewCount(videoId: string, userId: string): number {
    const views = this.getUserViews();
    const userVideoViews = views.filter(
      (view) => view.videoId === videoId && view.userId === userId
    );

    const now = Date.now();
    const recentViews = userVideoViews.filter(
      (view) => now - view.timestamp < this.SESSION_DURATION
    );

    return recentViews.reduce((sum, view) => sum + view.viewCount, 0);
  }
}
