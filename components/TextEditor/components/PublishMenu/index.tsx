import React, {useState}from "react";
import styles from "./publishMenu.module.css";
import { Grid, Box, TextField, Button } from "@mui/material";

export const PublishMenu = ({onSave}) => {
  const [title, setTitle] = React.useState("");

  return (
    <Box className={styles.container}>
      <Grid container spacing={2} justifyContent={"center"} alignItems={'center'}>
        <Grid item xs={3}>
          <TextField label='Title'size="small" onChange={(e)=>setTitle(e.target.value)} />
        </Grid>
        <Grid item xs={3}>
          <Button size="small" variant="contained" color="primary" onClick={()=>{onSave(title,'draft')}}>Save as Draft</Button>
        </Grid>
        <Grid item xs={3}>
          <Button size="small" variant="contained" color="primary" onClick={()=>onSave(title)}>Publish</Button>
        </Grid>
      </Grid>
    </Box>
  );
};
