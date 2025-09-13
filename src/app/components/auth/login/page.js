"use client";
import React, { Suspense, useState } from "react";
import LoginForm from "../../loginForm"; // <-- Separate actual form here

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
