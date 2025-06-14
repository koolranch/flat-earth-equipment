import Crisp from "crisp-api";

const crisp = new Crisp();
crisp.authenticate(
  process.env.CRISP_TOKEN_IDENTIFIER!,
  process.env.CRISP_TOKEN_KEY!
);

export default crisp; 