<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import { authClient } from "@/lib/authClient";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

const router = useRouter();

// Email passed via router state from RegisterView
const email = ref<string>((history.state?.email as string) || "");

const otp = ref("");
const isSubmitting = ref(false);
const isResending = ref(false);
const isSuccess = ref(false);
const authError = ref<string | null>(null);

// Resend cooldown (60 s)
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;
const canResend = computed(() => resendCooldown.value === 0 && !isResending.value);

function startCooldown() {
  resendCooldown.value = 60;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onMounted(() => {
  if (!email.value) {
    // No email in state — user landed here directly; send them back
    router.replace({ name: "Register" });
    return;
  }
  // Start cooldown so they can't immediately resend
  startCooldown();
});

async function onSubmit() {
  if (!otp.value || otp.value.length !== 6) {
    authError.value = "Please enter the 6-digit code from your email.";
    return;
  }

  isSubmitting.value = true;
  authError.value = null;

  const { error } = await authClient.emailOtp.verifyEmail({
    email: email.value,
    otp: otp.value,
  });

  isSubmitting.value = false;

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "TOO_MANY_ATTEMPTS") {
      authError.value = "Too many incorrect attempts. Please request a new code.";
      otp.value = "";
      return;
    }
    authError.value = error.message || "Invalid code. Please try again.";
    otp.value = "";
    return;
  }

  isSuccess.value = true;
  toast.success("Email verified!", {
    description: "Your account is ready. Redirecting to login…",
  });

  setTimeout(() => {
    router.push({ name: "Dashboard" });
  }, 2000);
}

async function resendCode() {
  if (!canResend.value) return;

  isResending.value = true;
  authError.value = null;

  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: email.value,
    type: "email-verification",
  });

  isResending.value = false;

  if (error) {
    toast.error("Failed to resend code", {
      description: error.message || "Please try again in a moment.",
    });
    return;
  }

  toast.success("New code sent", {
    description: `A fresh verification code was sent to ${email.value}.`,
  });
  otp.value = "";
  startCooldown();
}

function handleOtpInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 6);
  otp.value = val;
  (e.target as HTMLInputElement).value = val;
  authError.value = null;
}
</script>

<template>
  <main class="grid min-h-screen place-items-center p-2">
    <div class="w-full max-w-sm">
      <Card class="bg-card">
        <!-- Success state -->
        <template v-if="isSuccess">
          <CardHeader class="flex flex-col items-center text-center">
            <div class="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <svg class="text-primary h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 class="text-xl font-semibold">Email verified!</h1>
            <p class="text-muted-foreground text-sm">Redirecting you to login…</p>
          </CardHeader>
        </template>

        <!-- OTP input state -->
        <template v-else>
          <CardHeader class="flex flex-col items-center text-center">
            <div class="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <svg class="text-primary h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 class="text-xl font-semibold">Check your email</h1>
            <p class="text-muted-foreground text-sm text-balance">
              We sent a 6-digit code to<br />
              <span class="text-foreground font-medium">{{ email }}</span>
            </p>
          </CardHeader>

          <CardContent class="flex flex-col gap-5">
            <p
              v-if="authError"
              role="alert"
              aria-live="assertive"
              class="text-destructive rounded-md border border-current/20 bg-current/5 px-3 py-2 text-center text-sm"
            >
              {{ authError }}
            </p>

            <form @submit.prevent="onSubmit" novalidate :aria-busy="isSubmitting" class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <label for="otp-input" class="ml-1 text-sm font-medium">Verification code</label>
                <input
                  id="otp-input"
                  :value="otp"
                  @input="handleOtpInput"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  placeholder="000000"
                  maxlength="6"
                  data-cy="otp-input"
                  :aria-invalid="!!authError"
                  :disabled="isSubmitting"
                  class="inputField placeholder:text-muted-foreground bg-input focus:border-ring focus:ring-ring/50 flex w-full min-w-0 appearance-none rounded-md border px-3 py-2 text-center font-mono text-2xl font-semibold tracking-[0.5em] shadow-xs transition-[color,box-shadow] outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button type="submit" class="w-full" :disabled="isSubmitting || otp.length !== 6" data-cy="verify-submit">
                {{ isSubmitting ? "Verifying…" : "Verify email" }}
              </Button>
            </form>

            <p class="text-muted-foreground text-center text-sm">
              Didn't receive the code?
              <button
                type="button"
                :disabled="!canResend"
                @click="resendCode"
                class="text-primary disabled:text-muted-foreground ml-1 font-medium underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline"
              >
                <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
                <span v-else>{{ isResending ? "Sending…" : "Resend code" }}</span>
              </button>
            </p>

            <p class="text-muted-foreground text-center text-sm">
              <Button variant="link" as-child class="h-auto p-0 text-sm">
                <router-link to="/register">← Back to registration</router-link>
              </Button>
            </p>
          </CardContent>
        </template>
      </Card>
    </div>
  </main>
</template>
