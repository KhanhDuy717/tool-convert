import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import copy from "copy-to-clipboard";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
interface FormValues {
  fields?: string;
  dtoName?: string;
  entityName?: string;
  convertTo?: string;
  result?: string;
  tableName: string;
  type?: string;
}
enum Type {
  MAPPER = "mapper",
  XML = "XML",
}

enum Convert {
  DTO = "dto",
  ENTITY = "entity",
}
function App() {
  const { watch, control, register, getValues, setValue } = useForm<FormValues>(
    {
      defaultValues: { convertTo: Convert.DTO, type: Type.MAPPER },
    }
  );
  const logicCamelCase = useCallback(
    (words: string[], pattern1?: string, pattern2?: string) => {
      if (words.length === 1) {
        return `${pattern1}.set${
          words[0].charAt(0).toUpperCase() +
          words[0].substring(1, words[0].length)
        }(${pattern2}.get${words}());`;
      }
      if (words) {
        const formatWord = words.map((word) => {
          return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
        });
        return formatWord.join("");
      }
    },
    []
  );

  const convertMapper = useCallback(
    (data?: FormValues) => {
      if (data?.fields === undefined || data?.fields === "") {
        return;
      }
      const fields = data?.fields?.split("\n");

      const pattern1 =
        data?.convertTo === Convert.ENTITY
          ? data?.entityName || Convert.ENTITY
          : data?.dtoName || Convert.DTO;
      const pattern2 =
        data?.convertTo !== Convert.ENTITY
          ? data?.entityName || Convert.ENTITY
          : data?.dtoName || Convert.DTO;

      const convertString = fields?.map((field) => {
        const xml = field.split(" ");
        const words = field.split("_");
        if (
          xml[0] === "" ||
          xml[0].includes("<") ||
          xml[0].includes("xml") ||
          xml[0].includes("version") ||
          xml[0].includes("dataset") ||
          xml[0].includes("standalone")
        ) {
          return undefined;
        }

        if (words && words.length === 1) {
          return `${pattern1}.set${
            words[0].charAt(0).toUpperCase() +
            words[0].substring(1, words[0].length)
          }(${pattern2}.get${words}());`;
        }

        const camelCase = logicCamelCase(words, pattern1, pattern2);
        return `${pattern1}.set${camelCase}(${pattern2}.get${camelCase}());`;
      });
      return convertString?.join("\n");
    },
    [logicCamelCase]
  );

  const logicConvertXml = useCallback(
    (dataRow: string[], pattern1: string, indexData: number) => {
      let xmlArray = "";
      dataRow.map((row, index) => {
        if (
          index !== 0 &&
          !row.includes("xml") &&
          !row.includes("version") &&
          !row.includes("standalone")
        ) {
          const subIndex = row.indexOf("=");
          const nameDto = row.substring(0, subIndex);
          const camelCase = logicCamelCase(nameDto.split("_"));
          const subData = row.substring(subIndex + 2, row.length - 1);
          const resultSet =
            pattern1 +
            (indexData + 1) +
            ".set" +
            camelCase +
            '("' +
            subData +
            '");';
          xmlArray += resultSet + "\n";
        }
      });
      return xmlArray;
    },
    [logicCamelCase]
  );

  const handleToXmlNoTableName = useCallback(
    (data: FormValues, pattern1: string, dataRows: string[][]) => {
      let xmlArray = "";
      dataRows.map((row, index) => {
        if (
          row &&
          row[0]
            .replace("_", "")
            .toUpperCase()
            .includes(data.tableName.toUpperCase().replace("_", "").trim())
        ) {
          const result = logicConvertXml(row, pattern1, index);
          if (result) {
            xmlArray += "\n//data " + (index + 1) + "\n";
            xmlArray += result;
          }
        }
      });
      return xmlArray;
    },
    [logicConvertXml]
  );

  const convertXml = useCallback(
    (data: FormValues) => {
      const xml = data?.fields?.split("\n");
      const dataRows = xml?.map((row) => {
        return row.split(" ");
      });

      if (!dataRows) {
        return;
      }

      const pattern1 = data?.dtoName || Convert.DTO;
      if (
        (data.tableName && data.tableName !== "") ||
        data.tableName !== undefined
      ) {
        handleToXmlNoTableName(data, pattern1, dataRows);
      }
      let xmlArray = "";
      dataRows.map((row, index) => {
        const result = logicConvertXml(row, pattern1, index);
        if (result) {
          xmlArray += "\n//data " + (index + 1) + "\n";
          xmlArray += result;
        }
      });
      return xmlArray;
    },
    [handleToXmlNoTableName, logicConvertXml]
  );

  const convert = useCallback(
    (data?: FormValues) => {
      if (!data) {
        return;
      }
      if (data?.type === Type.MAPPER) {
        setValue("result", convertMapper(data)?.replace("\n", ""));
        return;
      }
      setValue("result", convertXml(data));
    },
    [convertMapper, convertXml, setValue]
  );

  const convertTo = watch("convertTo");
  const fields = watch("fields");
  const entity = watch("entityName");
  const dto = watch("dtoName");
  const tableName = watch("tableName");
  const type = watch("type");
  const disabled = useMemo(() => type === Type.MAPPER, [type]);
  const result = useMemo(
    () =>
      convert({
        convertTo: convertTo,
        fields: fields,
        tableName: tableName,
        entityName: entity,
        dtoName: dto,
        type: type,
      }),

    [convert, convertTo, dto, entity, fields, tableName, type]
  );

  const handleCopy = useCallback(() => {
    const convertedData = getValues("result");
    if (convertedData) {
      copy(convertedData);
    }
  }, [getValues]);
  return (
    <>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        marginTop={5}>
        <Grid item xs={12} sm={11}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} textAlign="center">
              <h1>TOOL CONVERT SIÊU CẤP VÍP PRO</h1>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container xs={11} sm={11} lg={11} md={11}>
          <Grid item container xs={5.5} md={5.5} sm={5.5}>
            <Grid item container xs={6} md={6} sm={6} lg={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      value="mapper"
                      control={<Radio />}
                      label="Mapper"
                      defaultChecked
                    />
                    <FormControlLabel
                      value="XML"
                      control={<Radio />}
                      label="XML"
                    />
                  </RadioGroup>
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item container xs={5.5} sm={5.5} lg={5.5} md={5.5}>
          <Grid item container xs={12} md={12} sm={12} spacing={5}>
            <Grid item xs={6}>
              <TextField
                label="DTO Name"
                size="small"
                fullWidth
                inputProps={{ "data-testid": "dtoName" }}
                {...register("dtoName")}
              />
            </Grid>
            {disabled && (
              <Grid item xs={6}>
                <TextField
                  label="Entity Name"
                  size="small"
                  fullWidth
                  inputProps={{ "data-testid": "entityName" }}
                  {...register("entityName")}
                />
              </Grid>
            )}
            {!disabled && (
              <Grid item xs={6}>
                <TextField
                  label="Table Name"
                  fullWidth
                  size="small"
                  inputProps={{ "data-testid": "tableName" }}
                  {...register("tableName")}
                />
              </Grid>
            )}
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            md={12}
            marginTop={2}
            marginBottom={3}>
            <TextField
              label="Fields"
              multiline
              rows={15}
              fullWidth
              inputProps={{ "data-testid": "fields" }}
              {...register("fields")}
            />
          </Grid>
        </Grid>
        <Grid item container xs={5.5} sm={5.5} lg={5.5} md={5.5}>
          <Grid item container xs={12} md={12} sm={12}>
            <Grid item container xs={8.5} md={8.5} sm={8.5} lg={8.5}>
              {!disabled && (
                <Controller
                  name="convertTo"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value={Convert.DTO}
                        control={<Radio />}
                        label="Covert to Dto"
                        defaultChecked
                      />
                      <FormControlLabel
                        value={Convert.ENTITY}
                        control={<Radio />}
                        label="Convert to Entity"
                      />
                    </RadioGroup>
                  )}
                />
              )}
            </Grid>
            {/* Rest of the code */}
            <Grid
              item
              container
              xs={3.5}
              md={3.5}
              sm={3.5}
              lg={3.5}
              justifyContent="flex-end">
              <Grid item>
                <Button variant="contained" onClick={handleCopy}>
                  Copy Data
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            md={12}
            marginTop={2}
            marginBottom={3}>
            <TextField
              label="Result"
              focused
              multiline
              rows={15}
              fullWidth
              inputProps={{ "data-testid": "result" }}
              value={result}
              {...register("result")}
              aria-readonly
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
