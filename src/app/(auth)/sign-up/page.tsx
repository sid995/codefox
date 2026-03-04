"use client";

import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFormStatus } from "react-dom";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Loading..." : children}
    </Button>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  const [error, submitEmailAction, isPendingEmail] = useActionState<
    string | null,
    FormData
  >(async (_, formData) => {
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const result = await signUp.email({
      name: name ?? "",
      email: email ?? "",
      password: password ?? "",
    });

    if (result.error) {
      return result.error.message || "An error occurred";
    }
    router.push("/repos");
    return null;
  }, null);

  const [isPendingGithub, startGithubTransition] = useTransition();
  const githubAction = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/repos",
    });
  };

  const pendingSignin: boolean = isPendingGithub || isPendingEmail;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Sign up with your email or GitHub account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              startGithubTransition(githubAction);
            }}
            disabled={pendingSignin}
          >
            <FaGithub className="mr-2 size-4" />
            {isPendingGithub ? "Signing up..." : "Sign up with GitHub"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form action={submitEmailAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="name"
                name="name"
                placeholder="Full Name"
                disabled={pendingSignin}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                disabled={pendingSignin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                disabled={pendingSignin}
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <SubmitButton>Sign Up</SubmitButton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/sign-in">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
