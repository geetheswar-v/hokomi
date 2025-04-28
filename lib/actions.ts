"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { SignInInput, SignUpInput, ForgotPasswordInput, ResetPasswordInput } from "@/lib/validations";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendVerificationEmail, sendPasswordResetEmail, generateToken } from "@/lib/email";
import prisma from "@/lib/prisma";

export async function signInAction(data: SignInInput) {
  try {
    // First check if the user exists and if email is verified
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (user && user.password) {
      // Verify password first
      const isValidPassword = await verifyPassword(data.password, user.password);
      
      if (isValidPassword && !user.emailVerified) {
        return { error: "Please verify your email before signing in" };
      }
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    
    if (result?.error) {
      return { error: "Invalid credentials" };
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function signUpAction(data: SignUpInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = await generateToken();

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      }
    });

    // Create verification token
    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    await sendVerificationEmail(data.email, verificationToken);

    return { success: true, message: "Account created! Please check your email to verify your account." };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Something went wrong" };
  }
}

export async function forgotPasswordAction(data: ForgotPasswordInput) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return { error: "User not found" };
    }

    const resetToken = await generateToken();

    // Delete existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: data.email }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email: data.email,
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }
    });

    await sendPasswordResetEmail(data.email, resetToken);

    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Something went wrong" };
  }
}

export async function resetPasswordAction(token: string, data: ResetPasswordInput) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: "Invalid or expired token" };
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // Delete the reset token
    await prisma.passwordResetToken.delete({
      where: { token }
    });

    return { success: true, message: "Password reset successfully!" };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong" };
  }
}

export async function verifyEmailAction(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { error: "Invalid or expired token" };
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token
        }
      }
    });

    return { success: true, message: "Email verified successfully!" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { error: "Something went wrong" };
  }
}
