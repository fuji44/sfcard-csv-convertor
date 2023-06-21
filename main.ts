import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { SFCardCsvLoader, SFCardRecord } from "./model.ts";

const ConvertType = new EnumType(["json"]);

function printJSON(records: SFCardRecord[]) {
  console.log(JSON.stringify(records));
}

await new Command()
  .name("sfcv")
  .description("SFCard Viewerで出力したCSVを変換します")
  .version("v0.1.0")
  .type("convert-type", ConvertType)
  .option("-t, --type <type:convert-type>", "変換する形式", {
    default: "json",
  })
  .arguments("<csv-path:string>")
  .action(
    async ({ type }, csvPath) => {
      const loader = new SFCardCsvLoader(csvPath);
      await loader.load();
      switch (type) {
        case "json":
          printJSON(loader.records);
          break;
      }
    },
  )
  .parse(Deno.args);
