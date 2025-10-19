import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { Snackbar } from "@mui/material";

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [open, setOpen] = React.useState(false);
  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  const [bgLoaded, setBgLoaded] = React.useState(false);
  const imageUrl =
    "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80";

  React.useEffect(() => {
    // Preload image
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setBgLoaded(true);
  }, [imageUrl]);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
        setName("");
      }
    } catch (err) {
      console.log(err);
      const message = err?.response?.data?.message || "Something went wrong";
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        {/* IMAGE SIDE (Fixed width + smooth transition) */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            position: "relative",
            minWidth: { sm: "80%", md: "66.2%" },
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: bgLoaded ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          />
        </Grid>

        {/* FORM SIDE */}
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            {/* Toggle Buttons */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            {/* FORM BOX with FIXED WIDTH */}
            <Box
              component="form"
              noValidate
              sx={{
                mt: 1,
                width: "100%",
                maxWidth: "450px", //  fixed width for form
                transition: "height 0.3s ease",
              }}
            >
              {/* Full Name Field (Sign Up only) */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullname"
                label="Full Name"
                name="fullname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ display: formState === 1 ? "block" : "none" }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />

              {error && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 1, textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  );
}
