import { describe, it, expect } from 'vitest'
import { Action, generateToken } from '.';

const TGInitData =
  "user=%7B%22id%22%3A437665904%2C%22first_name%22%3A%22Dylan%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22dylanduan%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=5426530907076924803&chat_type=group&auth_date=1699501071&hash=68bf5977d20b6dd1393a6f256173bc1d8254839ca9b0c822d906aff4d2f36aca";

describe("generate telegram mini app token", () => {
  it("connect token", async () => {
    const token = generateToken(TGInitData, Action.Connect);
    expect(token.length).toBe(76)
    expect(token.substring(0, 68)).toBe("conncd6f828cfb86eba318e4f85733c9178fd6c7c45256034604f67463c36282d2cc");
  });

  it("sign token", async () => {
    const token = generateToken(TGInitData, Action.SignMsg);
    expect(token.length).toBe(76);
    expect(token.substring(0, 68)).toBe("signcd6f828cfb86eba318e4f85733c9178fd6c7c45256034604f67463c36282d2cc");
  });


  it("sign token", async () => {
    const token = generateToken(TGInitData, Action.SendTx);
    expect(token.length).toBe(76);
    expect(token.substring(0, 68)).toBe("sendcd6f828cfb86eba318e4f85733c9178fd6c7c45256034604f67463c36282d2cc");
  });
});
