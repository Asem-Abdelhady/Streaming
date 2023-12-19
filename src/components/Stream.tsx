import { Stack, styled } from "@mui/material";

export default function Stream() {
  return (
    <Stack direction="row" style={{ height: "100%" }}>
      <StreamContainer>TODO: Stream</StreamContainer>
      <ObjectsContainer>TODO: Objects</ObjectsContainer>
    </Stack>
  );
}

const StreamContainer = styled("div")`
  width: 50%;
`;

const ObjectsContainer = styled("div")`
  flex: 1;
`;
