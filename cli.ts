import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { SFCardCsvLoader, SFCardRecord } from "./model.ts";

function printJSON(records: SFCardRecord[]) {
  console.log(JSON.stringify(records));
}

function createJsonCommand() {
  return new Command()
    .description("JSONに変換します")
    .arguments("<csv-path:string>")
    .action(async (_, csvPath) => {
      const loader = new SFCardCsvLoader(csvPath);
      await loader.load();
      printJSON(loader.records);
    });
}

await new Command()
  .name("sfcc")
  .description("SFCard Viewerで出力したCSVを変換します")
  .version("v0.1.0")
  .command("json", createJsonCommand())
  .parse(Deno.args);
