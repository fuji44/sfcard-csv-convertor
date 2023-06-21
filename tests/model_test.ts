import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { SFCardCsvLoader } from "../model.ts";

Deno.test(async function addTest() {
  const loader = new SFCardCsvLoader("./tests/model_test.csv");
  await loader.load();
  assertEquals(loader.records.length, 20);
});
