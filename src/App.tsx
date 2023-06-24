import {
  Badge,
  Button,
  Card,
  Group,
  Image,
  SimpleGrid,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import createFuzzyMatcher from "./utils/createFuzzyMatcher";
import data from "./data.json";
import { useDebouncedValue } from "@mantine/hooks";

type Row = (typeof data)[0];

const indexed = data.map((row) => ({
  ...row,
  index: [...(row.keywords ?? []), ...(row.characters ?? []), row.title],
}));

function App() {
  const [keyword, setKeyword] = useState("");
  const result = useMemo(() => {
    const rs = keyword
      .split(/[ ,]/g)
      .map((e) => e.trim())
      .filter(Boolean)
      .map((e) => createFuzzyMatcher(e));
    return indexed.filter((row) =>
      rs.every((r) => row.index.some((e) => r.test(e)))
    );
  }, [keyword]);
  return (
    <>
      <div>
        <SearchTextBox setKeyword={setKeyword} />
      </div>

      <Space h="md" />
      <SimpleGrid
        cols={4}
        spacing="xl"
        breakpoints={[
          { maxWidth: "62rem", cols: 3, spacing: "md" },
          { maxWidth: "48rem", cols: 2, spacing: "sm" },
          { maxWidth: "36rem", cols: 1, spacing: "sm" },
        ]}
      >
        {result.map((row) => (
          <ResultItem row={row} />
        ))}
      </SimpleGrid>
    </>
  );
}

function SearchTextBox({
  setKeyword,
}: {
  setKeyword: (keyword: string) => void;
}) {
  const [value, setValue] = useState("");
  const [keyword] = useDebouncedValue(value, 500);
  useEffect(() => {
    setKeyword(keyword);
  }, [keyword, setKeyword]);
  return (
    <TextInput
      label="🧒🪄 키워드를 입력하세요"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  );
}

function ResultItem({ row }: { row: Row }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={`https://i3.ytimg.com/vi/${row.youtubeId}/hqdefault.jpg`}
          alt="Norway"
        />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{row.title}</Text>
        <Badge color="pink" variant="light">
          {row.category} {row.season} {row.serial}
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        {(row.characters ?? []).concat(row.keywords ?? []).join(" ")}
      </Text>

      <Button
        component="a"
        variant="light"
        color="blue"
        fullWidth
        mt="md"
        radius="md"
        href={`https://youtu.be/${row.youtubeId}`}
      >
        유튜브에서 보기
      </Button>
    </Card>
  );
}

export default App;
