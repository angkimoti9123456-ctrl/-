type VerificationRecord = {
    code: string
    expiresAt: number
}

const globalForVerification = globalThis as unknown as {
    verificationStore?: Map<string, VerificationRecord>
}

const verificationStore =
    globalForVerification.verificationStore ?? new Map<string, VerificationRecord>()

globalForVerification.verificationStore = verificationStore

export function saveVerificationCode(email: string, code: string, ttlMs = 180_000) {
    verificationStore.set(email.toLowerCase(), {
        code,
        expiresAt: Date.now() + ttlMs,
    })
}

export function checkVerificationCode(email: string, code: string) {
    const key = email.toLowerCase()
    const record = verificationStore.get(key)

    if (!record) {
        return { ok: false, message: "인증코드를 먼저 전송해 주세요." as const }
    }

    if (Date.now() > record.expiresAt) {
        verificationStore.delete(key)
        return { ok: false, message: "인증코드가 만료되었습니다." as const }
    }

    if (record.code !== code) {
        return { ok: false, message: "인증코드가 일치하지 않습니다." as const }
    }

    return { ok: true as const }
}

export function clearVerificationCode(email: string) {
    verificationStore.delete(email.toLowerCase())
}