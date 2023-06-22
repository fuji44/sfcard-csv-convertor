import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { SFCardCsvLoader } from "../model.ts";

Deno.test(async function basicHistory() {
  const loader = new SFCardCsvLoader("./tests/basic.csv");
  await loader.load();
  assertEquals(loader.records.length, 20);
  assertEquals(loader.cardId, "basic_0000000001");
});

Deno.test(async function commuterPassHistory() {
  const loader = new SFCardCsvLoader("./tests/commuter_pass.csv");
  await loader.load();
  assertEquals(loader.records.length, 20);
  assertEquals(loader.cardId, "commuter_pass_01");
});
