-- CreateTable
CREATE TABLE "SignInRequest" (
    "ref" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignInRequest_pkey" PRIMARY KEY ("ref")
);
