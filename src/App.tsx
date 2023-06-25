import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  List,
  MediaQuery,
  SimpleGrid,
  Space,
  Text,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import createFuzzyMatcher from "./utils/createFuzzyMatcher";
import data from "./data.json";
import { useDebouncedValue } from "@mantine/hooks";

type Row = (typeof data)[0];

function unique(arr: string[]) {
  return [...new Set(arr)];
}
function flatUnique(arr: string[]) {
  return unique(
    arr
      .flatMap((index) => index.split(/[ ,]/g))
      .map((e) => e.trim())
      .filter(Boolean)
  );
}

function search(rs: RegExp[], data: Row[]): Row[] {
  type Ranked = {
    row: Row;
    hasTitle: boolean;
    hasKeyword: boolean;
    hasCharacter: boolean;
    score: number;
  };
  const ranked: Ranked[] = [];
  for (const row of data) {
    ranked.push({
      row,
      hasTitle: rs.every((r) => r.test(row.title)),
      hasKeyword: rs.every((r) => (row.keywords ?? []).some((e) => r.test(e))),
      hasCharacter: rs.every((r) =>
        (row.characters ?? []).some((e) => r.test(e))
      ),
      score: 0,
    });
  }
  ranked.forEach((r) => {
    r.score =
      (r.hasTitle ? 8 : 0) + (r.hasCharacter ? 4 : 0) + (r.hasKeyword ? 2 : 0);
  });
  return ranked
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.row);
}

const allKeywords = flatUnique(
  data.flatMap((row) => [...(row.keywords ?? []), ...(row.characters ?? [])])
);

function App() {
  const [keyword, setKeyword] = useState("");
  const rs = useMemo(() => {
    return keyword
      .split(/[ ,]/g)
      .map((e) => e.trim())
      .filter(Boolean)
      .map((e) => createFuzzyMatcher(e));
  }, [keyword]);
  const result = useMemo(() => {
    return search(rs, data);
  }, [rs]);
  const suggestion = useMemo(() => {
    return allKeywords.filter((e) => rs.every((r) => r.test(e)));
  }, [rs]);
  return (
    <>
      <div>
        <SearchTextBox setKeyword={setKeyword} suggestion={suggestion} />
      </div>

      <Space h="md" />
      <MediaQuery query="(max-width: 36em)" styles={{ display: "none" }}>
        <SimpleGrid
          cols={4}
          breakpoints={[
            { maxWidth: "62rem", cols: 3, spacing: "md" },
            { maxWidth: "48rem", cols: 2, spacing: "sm" },
          ]}
          spacing="xl"
        >
          {result.map((row) => (
            <ResultItem row={row} />
          ))}
        </SimpleGrid>
      </MediaQuery>
      <MediaQuery query="(min-width: 36em)" styles={{ display: "none" }}>
        <List spacing="sm">
          {result.map((row) => (
            <ResultListItem row={row} />
          ))}
        </List>
      </MediaQuery>
    </>
  );
}

function SearchTextBox({
  setKeyword,
  suggestion,
}: {
  setKeyword: (keyword: string) => void;
  suggestion: string[];
}) {
  const [value, setValue] = useState("");
  const [keyword] = useDebouncedValue(value, 300);
  useEffect(() => {
    setKeyword(keyword);
  }, [keyword, setKeyword]);

  return (
    <Autocomplete
      label={
        <Text size="xl" mb={8}>
          🧒🪄 키워드를 입력하세요
        </Text>
      }
      placeholder="'에디 우주'와 같이 검색해보세요!"
      value={value}
      size="xl"
      mb={12}
      onChange={setValue}
      data={suggestion.includes(keyword) ? [] : suggestion}
    />
  );
}

function ResultItem({ row }: { row: Row }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={`https://i3.ytimg.com/vi/${row.youtubeId}/hqdefault.jpg`} />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>
          {row.serial}. {row.title}
        </Text>
        <Badge color="pink" variant="light">
          {row.category} {row.season}
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

function ResultListItem({ row }: { row: Row }) {
  return (
    <List.Item
      icon={
        <Image
          src={`https://i3.ytimg.com/vi/${row.youtubeId}/hqdefault.jpg`}
          width={120}
          alt="Norway"
        />
      }
      onClick={() => window.open(`https://youtu.be/${row.youtubeId}`)}
    >
      <Badge mt="xs">
        {row.category} {row.season}
      </Badge>
      <Text weight={500} mb="xs">
        {row.serial}. {row.title}
      </Text>

      <Box w={210}>
        <Text size="sm" color="dimmed" truncate>
          {flatUnique((row.characters ?? []).concat(row.keywords ?? [])).join(
            " "
          )}
        </Text>
      </Box>
    </List.Item>
  );
}

export default App;
