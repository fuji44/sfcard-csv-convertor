# sfcard-csv-convertor

Converts CSV files exported by
[SFCard Viewer Web](https://www.sony.co.jp/Products/felica/consumer/app/sfcardviewer_web.html)

## Install / Uninstall

Install

```shell
deno install --allow-read -n sfcc https://raw.githubusercontent.com/fuji44/sfcard-csv-convertor/main/cli.ts
```

Uninstall

```shell
deno uninstall sfcc
```

## Usage

```shell
sfcc json ./example.csv
```

See the help option for more information.

### Convert CSV

Based on the value of each cell read from the source CSV, you can output to CSV
according to the template specified in the options.

```shell
$ sfcc csv ./example.csv --template timestamp,amountYen,memo
2012/12/26,130,
2012/12/25,380,物販
2012/12/21,130,
2012/12/13,210,
2012/12/13,400,
```

## Development

### Run

```shell
deno task json ./example.csv
```

### Compile

```shell
deno task compile
```

`./dist` directory will output the executable binary.

### Test

```shell
deno task test
```
