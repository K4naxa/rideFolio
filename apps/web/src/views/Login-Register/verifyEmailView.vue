<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import { authClient } from "@/lib/authClient";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isVerifying = ref(false);
const isSuccess = ref(false);
const errorMessage = ref<string | null>("Invalid verification link.");

onMounted(async () => {
  const token = route.query.token as string | undefined;

  if (!token) {
    errorMessage.value = "Invalid verification link.";
    isVerifying.value = false;
    return;
  }

  try {
    await authClient.verifyEmail({
      query: {
        token: token,
      },
    });
    isSuccess.value = true;
    isVerifying.value = false;

    setTimeout(() => {
      router.push({ name: "dashboard" });
    }, 2000);
  } catch (error: unknown) {
    const err = error as { message?: string };
    errorMessage.value = err?.message || "An error occurred during verification.";
    isVerifying.value = false;
  }
});
</script>
<template>
  <div class="flex min-h-screen items-center justify-center">
    <Card class="w-full max-w-md" :class="!!errorMessage && 'border-destructive'">
      <!-- Loading State -->
      <CardContent>
        <div v-if="isVerifying" class="text-center">
          <div class="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <h2 class="mt-4 text-xl font-semibold">Verifying your email...</h2>
          <p class="text-muted-foreground mt-2">Please wait while we verify your email address.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isSuccess" class="text-center">
          <div class="bg-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <svg class="text-success-foreground h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="mt-4 text-xl font-semibold">Email Verified!</h2>
          <p class="text-muted-foreground mt-2">
            Your email has been successfully verified. <br />
            Redirecting to login...
          </p>
        </div>

        <!-- Error State -->
        <div v-else class="text-center">
          <div class="bg-destructive mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <svg class="text-destructive-foreground h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-destructive-foreground mt-4 text-xl font-semibold">Verification Failed</h2>
          <p class="text-muted-foreground mt-2">{{ errorMessage }}</p>
          <Button variant="link" @click="router.push('/auth/login')" class="mt-6"> Go back to Login </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
