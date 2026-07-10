import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function DecisionNotificationEmail({
  title,
  conferenceName,
  decision,
  comments,
}: {
  title: string;
  conferenceName: string;
  decision: "ACCEPT" | "REJECT";
  comments: string[];
}) {
  const isAccepted = decision === "ACCEPT";

  return (
    <Html>
      <Head />
      <Preview>
        {conferenceName} -{" "}
        {isAccepted ? "Your submission has been accepted" : "Decision on your submission"}
      </Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">{isAccepted ? "Congratulations!" : "Submission Decision"}</Heading>
          <Text>
            The {conferenceName} organizing committee has completed its review of your submission:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</Text>
          <Text>
            {isAccepted
              ? "We are pleased to inform you that your submission has been accepted."
              : "We regret to inform you that your submission was not accepted this time."}
          </Text>
          {comments.length > 0 && (
            <>
              <Text style={{ fontWeight: "bold" }}>Reviewer comments:</Text>
              {comments.map((c, i) => (
                <Text key={i} style={{ whiteSpace: "pre-wrap" }}>
                  {c}
                </Text>
              ))}
            </>
          )}
          <Text>Thank you for your submission to {conferenceName}.</Text>
        </Container>
      </Body>
    </Html>
  );
}
