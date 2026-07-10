import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function SubmissionConfirmationEmail({
  title,
  conferenceName,
}: {
  title: string;
  conferenceName: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{conferenceName} - 投稿を受け付けました</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "24px" }}>
        <Container>
          <Heading as="h2">投稿を受け付けました</Heading>
          <Text>{conferenceName} 事務局です。以下のAbstractの投稿を受け付けました。</Text>
          <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</Text>
          <Text>
            査読の結果は、採否通知の期日までにメールでご連絡いたします。内容の修正が必要な場合は、投稿締切までシステム上で編集が可能です。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
