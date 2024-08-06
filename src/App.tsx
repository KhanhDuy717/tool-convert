import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import copy from "copy-to-clipboard";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
interface FormValues {
  type?: string;
  params?: string;
  result?: string;
}

function App() {
  const { control, register, getValues, setValue } = useForm<FormValues>({
    defaultValues: { type: "1" },
  });

  const handleOnChangeParams = useCallback(() => {
    const values = getValues("params");
    const params = values
      ?.replace(/[-'"]/g, "")
      ?.replace(/[\s]/g, ",")
      ?.split(",");
    if (params && params?.length <= 0) {
      return;
    }
    const type = getValues("type") === "1" ? "String" : "Boolean";
    let results: string[] = [];
    params?.map((name) => {
      if (name && name !== "") {
        const param =
          '{"DataType":"' +
          type +
          '","Name":"' +
          name +
          '","Nullable":true,"Prompt":"' +
          name +
          '","ValidValues":{"OrderBy":{"Condition":"None"}}}';
        if (!results?.includes(param)) {
          results?.push(param);
        }
      }
    });
    if (results?.length <= 0) {
      return;
    }
    setValue("result", results.join(","));
    return;
  }, [getValues, setValue]);

  const handleOnClearText = useCallback(() => {
    setValue("params", "");
    setValue("result", "");
  }, [setValue]);

  const handleCopy = useCallback(() => {
    const params = getValues("result");
    if (params) {
      copy(params);
    }
  }, [getValues]);
  const handleChangeInput = useCallback(() => {
    setValue("result", "");
  }, [setValue]);

  const handleOnChangeToString = useCallback(() => {
    setValue("type", "1");
    handleOnChangeParams();
  }, [handleOnChangeParams, setValue]);

  const handleOnChangeToBoolean = useCallback(() => {
    setValue("type", "0");
    handleOnChangeParams();
  }, [handleOnChangeParams, setValue]);
  return (
    <>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        marginTop={5}
        marginLeft={2}>
        <img
          src="data:image/png;base64,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"
          alt=""
        />
        <Grid item xs={12} sm={11}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} textAlign="center">
              <h1>Active Report</h1>
            </Grid>
            <Grid item container>
              <Grid item container justifyContent="left" alignContent="left">
                <Grid item xs={2} md={2} xl={1.5} lg={1.5}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="1"
                          control={<Radio />}
                          label="String"
                          onChange={handleOnChangeToString}
                        />
                        <FormControlLabel
                          value="0"
                          control={<Radio />}
                          label="Boolean"
                          onChange={handleOnChangeToBoolean}
                        />
                      </RadioGroup>
                    )}
                  />
                </Grid>
                <Grid
                  item
                  container
                  spacing={2}
                  xs={4}
                  md={4}
                  xl={4}
                  lg={4}
                  justifyContent="flex-start"
                  alignContent="flex-start"
                  alignItems="flex-start">
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleOnChangeParams}
                      fullWidth>
                      Create
                    </Button>
                  </Grid>

                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleOnClearText}
                      fullWidth>
                      Clear
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  item
                  container
                  spacing={2}
                  xs={3}
                  md={3}
                  xl={3}
                  lg={3}
                  marginLeft={8.7}
                  justifyContent="flex-start"
                  alignContent="flex-start"
                  alignItems="flex-start">
                  <Grid item>
                    <Button variant="contained" onClick={handleCopy} fullWidth>
                      Copy
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          container
          spacing={3}
          alignContent="center"
          justifyContent="center">
          <Grid item container xs={5.5} sm={5.5} lg={5.5} md={5.5}>
            <Grid item container>
              <TextField
                label="Params input"
                multiline
                rows={15}
                fullWidth
                inputProps={{ "data-testid": "params" }}
                {...register("params")}
                aria-readonly
                onChange={handleChangeInput}
              />
            </Grid>
          </Grid>
          <Grid item container xs={5.5} sm={5.5} lg={5.5} md={5.5} left={3}>
            <Grid item container>
              <Grid item xs={11} sm={11} lg={11} md={11}>
                <TextField
                  focused
                  multiline
                  rows={15}
                  fullWidth
                  inputProps={{ "data-testid": "result" }}
                  {...register("result")}
                  aria-readonly
                  disabled
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
