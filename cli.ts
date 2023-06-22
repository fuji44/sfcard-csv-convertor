import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import {
  SFCardCsvLoader,
  SFCardRecord,
  toArraySFCardStyleRecord,
} from "./model.ts";

function printJson(records: SFCardRecord[]) {
  console.log(JSON.stringify(records));
}

function printSFCardCsv(records: SFCardRecord[]) {
  console.log(
    records.map((r) => toArraySFCardStyleRecord(r).join(",")).join("\r\n"),
  );
}

function createJsonCommand() {
  return new Command()
    .description("JSONに変換します")
    .arguments("<csv-path:string>")
    .action(async (_, csvPath) => {
      const loader = new SFCardCsvLoader(csvPath);
      await loader.load();
      printJson(loader.records);
    });
}

function createCsvCommand() {
  return new Command()
    .description("異なるフォーマットのCSVに変換します")
    .arguments("<csv-path:string>")
    .action(async (_, csvPath) => {
      const loader = new SFCardCsvLoader(csvPath);
      await loader.load();
      printSFCardCsv(loader.records);
    });
}

await new Command()
  .name("sfcc")
  .description("SFCard Viewerで出力したCSVを変換します")
  .version("v0.1.0")
  .command("json", createJsonCommand())
  .command("csv", createCsvCommand())
  .parse(Deno.args);
