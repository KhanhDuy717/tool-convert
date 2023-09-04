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

  const convertMapper = useCallback((data?: FormValues) => {
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
      const words = field.split("_");
      const formatWord = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
      });
      const camelCase = formatWord.join("");
      return `${pattern1}.set${camelCase}(${pattern2}.get${camelCase}());`;
    });
    return convertString?.join("\n");
  }, []);

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
          const upper =
            nameDto.substring(0, 1).toUpperCase() + nameDto.substring(1);
          const subData = row.substring(subIndex + 2, row.length - 2);
          const resultSet =
            pattern1 +
            (indexData + 1) +
            ".set" +
            upper +
            '("' +
            subData +
            '");';
          xmlArray += resultSet + "\n";
        }
      });
      return xmlArray;
    },
    []
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
      let xmlArray = "";
      if (
        (data.tableName && data.tableName !== "") ||
        data.tableName !== undefined
      ) {
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
              xmlArray += "//data " + (index + 1) + "\n";
              xmlArray += result;
            }
          }
        });
        return xmlArray;
      }

      dataRows.map((row, index) => {
        const result = logicConvertXml(row, pattern1, index);
        if (result) {
          xmlArray += "//data " + (index + 1) + "\n";
          xmlArray += result;
        }
      });
      return xmlArray;
    },
    [logicConvertXml]
  );

  const convert = useCallback(
    (data?: FormValues) => {
      if (!data) {
        return;
      }
      if (data?.type === Type.MAPPER) {
        setValue("result", convertMapper(data));
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
  const disabled = useMemo(() => type !== Type.MAPPER, [type]);
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
            <Grid item container xs={5.5} sm={5.5} lg={5.5} md={5.5}>
              <Grid item container xs={12} md={12} sm={12} spacing={5}>
                <Grid item xs={5.45}>
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
                <Grid item xs={6.5} md={6.5} sm={6.5}>
                  <TextField
                    label="Table Name"
                    fullWidth
                    size="small"
                    inputProps={{ "data-testid": "tableName" }}
                    {...register("tableName")}
                    disabled={disabled}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container xs={5.5} sm={5.5} lg={5.5} md={5.5}>
          <Grid item container xs={12} md={12} sm={12} spacing={5}>
            <Grid item xs={5}>
              <TextField
                label="DTO Name"
                size="small"
                fullWidth
                inputProps={{ "data-testid": "dtoName" }}
                {...register("dtoName")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Entity Name"
                size="small"
                fullWidth
                inputProps={{ "data-testid": "entityName" }}
                disabled={!disabled}
                {...register("entityName")}
              />
            </Grid>
          </Grid>
          <Grid
            item
            xs={11}
            sm={11}
            lg={11}
            md={11}
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
            <Grid item xs={8.75} md={8.75} sm={8.75}>
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
            <Grid item xs={3} md={3} sm={3}>
              <Button variant="contained" onClick={handleCopy}>
                Copy Data
              </Button>
            </Grid>
          </Grid>
          <Grid
            item
            xs={11}
            sm={11}
            lg={11}
            md={11}
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
