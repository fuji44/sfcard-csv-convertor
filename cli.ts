import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import {
  isTemplateKeys,
  SFCardCsvLoader,
  SFCardRecord,
  TemplateKey,
  templateKeyArray,
  templates,
  toStringArray,
} from "./model.ts";
import { ArgumentValue } from "https://deno.land/x/cliffy@v0.25.7/command/types.ts";

function templateKeys({ label, name, value }: ArgumentValue): TemplateKey[] {
  const keys = value.split(/ |,/).map((v) => v.trim());
  if (!isTemplateKeys(keys)) {
    throw new Error(
      `${label} "${name}" に許可されないキーが指定されました。指定されたキー配列 "${value}"。キーはカンマかスペースで区切ることができます。使用可能なキー: ${
        templateKeyArray.join(", ")
      }`,
    );
  }
  return keys;
}

function printJson(records: SFCardRecord[]) {
  console.log(JSON.stringify(records));
}

function printCsv(records: SFCardRecord[], template: string[]) {
  console.log(
    records.map((r) => toStringArray(r, template).join(",")).join("\r\n"),
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
    .type("template-keys", templateKeys)
    .option(
      "-t, --template=<keys:template-keys>",
      "出力するCSVの1行を表現するテンプレート文字列を指定します",
      { default: templates.SFCardOriginal },
    )
    .action(async ({ template }, csvPath) => {
      const loader = new SFCardCsvLoader(csvPath);
      await loader.load();
      // templateKey によって TemplateKey[] であることが確定しているので as cast を許容
      printCsv(loader.records, template as TemplateKey[]);
    });
}

await new Command()
  .name("sfcc")
  .description("SFCard Viewerで出力したCSVを変換します")
  .version("v0.1.0")
  .command("json", createJsonCommand())
  .command("csv", createCsvCommand())
  .parse(Deno.args);
