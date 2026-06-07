export type FeedbackSubmission = {
  id: string;
  email: string;
  message: string;
  createdAt: string;
  userAgent?: string;
  pageUrl?: string;
};

export type FeedbackPayload = {
  email: string;
  message: string;
  pageUrl?: string;
};
