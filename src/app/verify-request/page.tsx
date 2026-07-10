import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>メールを確認してください</CardTitle>
          <CardDescription>
            ログイン用のリンクを記載したメールを送信しました。メール内のリンクをクリックしてログインを完了してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          メールが届かない場合は、迷惑メールフォルダをご確認いただくか、しばらく待ってから再度お試しください。
        </CardContent>
      </Card>
    </div>
  );
}
