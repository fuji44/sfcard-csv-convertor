import { readCSV } from "https://deno.land/x/csv@v0.8.0/reader.ts";

export const templateKeyArray = [
  "cardId",
  "timestamp",
  "from.isCommuterPass",
  "from.companyName",
  "from.stationName",
  "to.isCommuterPass",
  "to.companyName",
  "to.stationName",
  "amountYen",
  "remainingAmountYen",
  "memo",
] as const;

export type TemplateKey = typeof templateKeyArray[number];

export function isTemplateKey(value: string): value is TemplateKey {
  return (templateKeyArray as readonly string[]).includes(value);
}

export function isTemplateKeys(values: string[]): values is TemplateKey[] {
  return values.every((key) => isTemplateKey(key));
}

export const templates = {
  /** SFCard Viewer CSV と同じ形式 */
  SFCardOriginal: [
    "timestamp",
    "from.isCommuterPass",
    "from.companyName",
    "from.stationName",
    "to.isCommuterPass",
    "to.companyName",
    "to.stationName",
    "amountYen",
    "remainingAmountYen",
    "memo",
  ],
  /** SFCard Viewer CSV にカードIDを追加した形式 */
  SFCardAddCardId: [
    "cardId",
    "timestamp",
    "from.isCommuterPass",
    "from.companyName",
    "from.stationName",
    "to.isCommuterPass",
    "to.companyName",
    "to.stationName",
    "amountYen",
    "remainingAmountYen",
    "memo",
  ],
};

/** 改札した際の情報を表現する */
export type SFCardTicketGateInfo = {
  /** 定期の区間内か？ */
  isCommuterPass: boolean;
  /** 鉄道会社名 */
  companyName: string;
  /** 入場、出場駅や事業者、降車場所の名前 */
  stationName: string;
};

/** SFCard Viewer の1レコードを表現する */
export type SFCardRecord = {
  /** CSVの1行目のカードID */
  cardId: string;
  /** 日付 (ISO8601年月日拡張形式) */
  timestamp: string;
  /** 入場時の改札情報 */
  from: SFCardTicketGateInfo;
  /** 出場時の改札情報 */
  to: SFCardTicketGateInfo;
  /** 利用額(円) */
  amountYen: number;
  /** 残額(円) */
  remainingAmountYen: number;
  /** メモ */
  memo: string;
};

export function toStringArray(
  r: SFCardRecord,
  template: TemplateKey[],
): string[] {
  return template.map((key) => {
    switch (key) {
      case "cardId":
        return r.cardId;
      case "timestamp":
        return convertSFCardStyleDateString(r.timestamp);
      case "from.isCommuterPass":
        return toStringForSFCardStyleBoolean(r.from.isCommuterPass);
      case "from.companyName":
        return r.from.companyName;
      case "from.stationName":
        return r.from.stationName;
      case "to.isCommuterPass":
        return toStringForSFCardStyleBoolean(r.to.isCommuterPass);
      case "to.companyName":
        return r.to.companyName;
      case "to.stationName":
        return r.to.stationName;
      case "amountYen":
        return r.amountYen.toString();
      case "remainingAmountYen":
        return r.remainingAmountYen.toString();
      case "memo":
        return r.memo;
      default:
        throw new Error(`unknown key ${key}`);
    }
  });
}

export function convertSFCardStyleDateString(date: string) {
  return date.replaceAll("-", "/");
}

export function convertIso8601DateString(date: string) {
  return date.replaceAll("/", "-");
}

export function toStringForSFCardStyleBoolean(bool: boolean) {
  return bool ? "〇" : "";
}

/** SFCard Viewer の CSV を表現する */
export class SFCardCsvLoader {
  csvPath: string;
  records: SFCardRecord[];
  cardId?: string;

  constructor(csvPath: string) {
    this.csvPath = csvPath;
    this.records = [];
  }

  async load() {
    const f = await Deno.open(this.csvPath, { read: true, write: false });
    readLine:
    for await (
      const row of readCSV(f, {
        encoding: "SJIS",
        fromLine: 0,
        lineSeparator: "\r\n",
      })
    ) {
      const record: Partial<SFCardRecord> = {};
      const from: Partial<SFCardTicketGateInfo> = {};
      const to: Partial<SFCardTicketGateInfo> = {};
      let col = 0;
      for await (const cell of row) {
        if (cell.startsWith("カードID=")) {
          this.cardId = cell.split("=")[1];
          continue readLine;
        }
        switch (col) {
          case 0:
            // 利用年月日
            if (cell === "利用年月日") {
              continue readLine;
            }
            record.timestamp = convertIso8601DateString(cell);
            break;
          case 1:
            // 定期
            from.isCommuterPass = cell ? true : false;
            break;
          case 2:
            // 鉄道会社名
            from.companyName = cell;
            break;
          case 3:
            // 入場駅/事業者名
            from.stationName = cell;
            break;
          case 4:
            // 定期
            to.isCommuterPass = cell ? true : false;
            break;
          case 5:
            // 鉄道会社名
            to.companyName = cell;
            break;
          case 6:
            // 出場駅/降車場所
            to.stationName = cell;
            break;
          case 7:
            // 利用額(円)
            record.amountYen = Number(cell);
            break;
          case 8:
            // 残額(円)
            record.remainingAmountYen = Number(cell);
            break;
          case 9:
            // メモ
            record.memo = cell;
            break;
          default:
            console.error(`unknown col: ${cell}`);
            break;
        }
        col++;
      }
      // asを使わない方法があれば修正する
      if (Object.keys(from).length > 0) {
        record.from = from as SFCardTicketGateInfo;
      }
      if (Object.keys(to).length > 0) {
        record.to = to as SFCardTicketGateInfo;
      }
      if (Object.keys(record).length > 0) {
        if (this.cardId) record.cardId = this.cardId;
        this.records.push(record as SFCardRecord);
      }
    }
    f.close();
  }
}
