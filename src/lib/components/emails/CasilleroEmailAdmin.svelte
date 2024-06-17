<script lang="ts">
  import {
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Img,
  } from "svelte-email";

  let logo =
    "https://res.cloudinary.com/dx312n0ce/image/upload/f_auto,q_auto/afmap1bg1ucjzl5fbd4s";

  const preview = "Nuevo Casillero Registrado";
  export let nombre: String;
  export let apellido: String;
  export let casillero: String;
  export let correo: String;
  export let cedula: String;
  export let telefono: String;
  export let sucursal: String;

  let codigo_de_compania = "XC";

  if (sucursal === "Dos Mares") {
    codigo_de_compania = "XCP";
  }

  let direccion = {
    direccion1: "7854 NW 46TH ST UNIT 2",
    estado: "FLORIDA",
    ciudad: "MIAMI",
    zip: "33166-5461",
    pais: "UNITED STATES",
    tel: "+1 786-622-1058",
  };

  const fontFamily =
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

  const main = {
    backgroundColor: "#ffffff",
  };

  const container = {
    "max-width": "50em",
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "100%",
  };

  const heading = {
    fontFamily,
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
  };

  const heading2 = {
    fontFamily,
    fontSize: "20px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
  };

  const paragraph = {
    fontFamily,
    fontSize: "18px",
    lineHeight: "1.4",
    color: "#484848",
  };

  const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
  };

  const logoIcon = {
    width: "17rem",
    height: "auto",
  };

  const logoContainer = {
    display: "flex",
    width: "fit-content",
    margin: "0 auto",
  };
</script>

<Html>
  <Head />
  <Preview {preview} />
  <Section style={main}>
    <Container style={container}>
      <Container style={logoContainer}>
        <Img
          src={logo}
          width="30"
          height="30"
          style={logoIcon}
          alt="Quality Cargo Services Logo"
        />
      </Container>
      <Heading style={heading}>Nuevo Casillero Registrado</Heading>
      <Text style={paragraph}>
        Un nuevo usuario se ha registrado. Debajo tendras la información del
        casillero del usuario.
      </Text>
      <Hr style={hr} />
      <Heading style={heading2}>Información del Usuario</Heading>
      <Text style={paragraph}>
        Nombre: {nombre}
        {apellido}
        <br />
        Cedula: {cedula}
        <br />
        Correo: {correo}
        <br />
        Telefono: {telefono}
      </Text>
      <Hr style={hr} />
      <Heading style={heading2}>Información del Casillero</Heading>
      <Text style={paragraph}>
        Nombre: {codigo_de_compania}
        {nombre}
        {apellido}
        <br />
        Address Line 1: {direccion.direccion1}
        {codigo_de_compania}
        <br />
        Address Line 2: {codigo_de_compania}{casillero}
        <br />
        City: {direccion.ciudad}
        <br />
        State: {direccion.estado}
        <br />
        Zip Code: {direccion.zip}
        <br />
        Country: {direccion.pais}
        <br />
        Tel: {direccion.tel}
      </Text>
    </Container>
  </Section>
</Html>
