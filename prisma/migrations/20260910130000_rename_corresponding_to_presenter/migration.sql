-- Co-author emails are becoming optional; the flag now marks the presenter.
ALTER TABLE "SubmissionAuthor" RENAME COLUMN "isCorresponding" TO "isPresenter";
