"use client";

import { useState, useTransition } from "react";
import { withdrawSubmissionAction } from "@/app/submissions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function WithdrawSubmissionButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await withdrawSubmissionAction(id);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">取り下げる</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿を取り下げますか?</DialogTitle>
          <DialogDescription>
            取り下げた投稿は再度編集・提出できません。この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "処理中..." : "取り下げる"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
