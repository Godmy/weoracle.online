# ServiceRosstat

`ServiceRosstat` is the server-side integration point for Rosstat data sources.
It lives next to the other external data services:

- `src/lib/server/class/service/cbr`
- `src/lib/server/class/service/ecb`
- `src/lib/server/class/service/fred`
- `src/lib/server/class/service/nasdaq-data-link`
- `src/lib/server/class/service/rosstat`

The current implementation adds the integration shell and a local source catalog.
It does not yet persist downloaded Rosstat observations into `src/lib/server/data`;
the only Rosstat file currently saved there is the known-indicator catalog:

```text
src/lib/server/data/json/rosstat/index.json
```

## Current Files

```text
src/lib/server/class/service/rosstat/index.ts
src/lib/server/class/service/rosstat/readme.md
src/lib/server/interface/api/rosstat/indicator/index.ts
src/lib/server/interface/api/rosstat/observation/index.ts
src/lib/server/data/json/rosstat/index.json
```

## What Is Already Saved

`src/lib/server/data/json/rosstat/index.json` contains a curated starting catalog
of Rosstat/Fedstat sources that are relevant to WeOracle:

1. `31074`
   - Source: Fedstat / EMISS
   - URL: `https://www.fedstat.ru/indicator/31074`
   - Topic: consumer price indices for goods and services
   - Useful filters: territory, indicator kind, period, year, goods/services
   - Tags: prices, inflation, regions

2. `62685`
   - Source: Fedstat / EMISS
   - URL: `https://www.fedstat.ru/indicator/62685`
   - Topic: annual consumer price index / macro inflation indicator
   - Useful filters: year, territory
   - Tags: prices, inflation, macro

3. `rosstat-price-page`
   - Source: Rosstat publication page
   - URL: `https://rosstat.gov.ru/statistics/price`
   - Topic: prices and inflation publications
   - Expected assets: XLS/XLSX tables for average consumer prices, weekly price
     monitoring, CPI, producer prices, and related price publications
   - Tags: prices, fuel, xlsx

4. `rosstat-opendata`
   - Source: Rosstat open data catalog
   - URL: `https://rosstat.gov.ru/opendata`
   - Topic: general open-data catalog
   - Expected assets: dataset metadata and downloadable CSV/XML-style resources
   - Tags: catalog, csv, metadata

## What The Service Can Do

`ServiceRosstat` currently exposes these methods:

```ts
ServiceRosstat.listKnownIndicators()
ServiceRosstat.getKnownIndicator(indicatorId)
ServiceRosstat.fetchIndicatorPage(indicatorId)
ServiceRosstat.extractDataIds(indicatorPageHtml)
ServiceRosstat.fetchIndicatorData(indicatorId)
ServiceRosstat.postDataIds(dataIds, format)
ServiceRosstat.fetchFilteredSdmx(indicatorId)
ServiceRosstat.parseSdmxObservations(indicatorId, xml)
```

### `listKnownIndicators`

Returns the local catalog from:

```text
src/lib/server/data/json/rosstat/index.json
```

This is useful for UI/API discovery before implementing a full Rosstat catalog
crawler.

### `getKnownIndicator`

Looks up one catalog entry by `id`.

Example:

```ts
const indicator = ServiceRosstat.getKnownIndicator('31074');
```

### `fetchIndicatorPage`

Downloads the HTML page for a Fedstat indicator:

```text
https://www.fedstat.ru/indicator/{indicatorId}
```

Fedstat pages contain JavaScript state with internal ids used by the later data
request. These ids are not generally derivable from human-readable filter names.

### `extractDataIds`

Tries to parse internal Fedstat `dataIds` from an indicator page.

Important limitation: this is a best-effort parser. Fedstat page internals are not
a stable public JSON contract. For robust production use, each important
indicator should have its filters pinned and tested.

### `fetchIndicatorData`

Downloads raw indicator data through the simpler endpoint:

```text
https://www.fedstat.ru/indicator/data.do?id={indicatorId}
```

Some public/open-data mirrors expose this style of resource directly. It is
useful for raw inspection, but it is not enough for all filtered Fedstat use
cases.

### `postDataIds`

Posts previously discovered internal data ids to Fedstat:

```text
https://www.fedstat.ru/indicator/data.do?format=sdmx
https://www.fedstat.ru/indicator/data.do?format=excel
```

Supported formats:

- `sdmx`
- `excel`

The response is returned as `ArrayBuffer` so callers can either parse XML-like
SDMX or save Excel bytes.

### `fetchFilteredSdmx`

Convenience method:

1. Fetches the Fedstat indicator page.
2. Extracts internal data ids.
3. POSTs them to `indicator/data.do?format=sdmx`.
4. Decodes the response as text.

This is the first automation path for real Fedstat data.

### `parseSdmxObservations`

Parses simple SDMX `<Obs ... />` / `<Obs>...</Obs>` records into:

```ts
interface RosstatObservation {
	indicatorId: string;
	time?: string;
	value: number | null;
	unit?: string;
	dimensions: Record<string, string>;
	rawAttributes: Record<string, string>;
}
```

The parser is intentionally conservative. It preserves all raw attributes so we
can inspect real Fedstat payloads before committing to stronger domain-specific
types.

## Fedstat Request Model

Fedstat / EMISS is not a clean "query by name, get JSON" API.

The practical flow is usually:

1. Choose an indicator id from a URL such as:

```text
https://www.fedstat.ru/indicator/31074
```

2. Fetch the indicator page HTML.

3. Parse internal filter/data ids from JavaScript embedded in the page.

4. Filter those ids by human-readable dimensions such as:

- territory
- year
- month/period
- goods and services category
- indicator kind
- unit

5. POST the selected ids to:

```text
https://www.fedstat.ru/indicator/data.do?format=sdmx
```

or:

```text
https://www.fedstat.ru/indicator/data.do?format=excel
```

6. Parse SDMX or store Excel.

The unofficial `fedstatAPIr` package documents the same practical constraint:
filter value ids often need to be parsed from the indicator web page because they
are internal Fedstat ids, not stable values that can be guessed from labels.

## Data We Can Realistically Get

Rosstat/Fedstat can cover a broad range of WeOracle baseline data.

### Prices And Inflation

Useful for Delphi sessions about prices, procurement, retail dynamics, budget
planning, and cost corridors.

Possible data:

- average consumer prices
- weekly price monitoring
- consumer price index
- CPI by goods/services group
- regional CPI
- food prices
- non-food goods prices
- service prices
- fuel prices, if exposed in the selected publication/indicator
- producer price indices
- industrial producer prices
- agricultural producer prices
- construction price indices

Practical first package:

```text
fuel-prices
```

Target rows:

- AI-92 gasoline
- AI-95 gasoline
- diesel fuel
- Russian Federation
- selected federal district
- selected region
- date/period
- rubles per liter
- source update date

### Labor Market

Useful for workforce, HR, AI adoption, automation, salary, and hiring Delphi
sessions.

Possible data:

- unemployment rate
- employment
- labor force
- average nominal wage
- real wage index
- wage arrears
- vacancies, where available
- regional labor market indicators

Practical package:

```text
labor-market
```

### Demographics

Useful for long-range demand, regional planning, healthcare, education, migration,
retail, and infrastructure sessions.

Possible data:

- population
- birth rate
- death rate
- natural increase/decrease
- migration
- age structure
- urban/rural population
- regional demographic indicators

Practical package:

```text
demographics
```

### Industry

Useful for production forecasts, supplier risk, sector demand, and capacity
planning.

Possible data:

- industrial production index
- production by economic activity
- manufacturing output
- mining output
- energy production
- shipment and inventory indicators
- regional industrial indicators

Practical package:

```text
industry
```

### Agriculture

Useful for food prices, harvest forecasts, supply-chain risk, and regional
production planning.

Possible data:

- crop production
- livestock indicators
- agricultural producer prices
- sown areas
- harvest
- regional agricultural output

Practical package:

```text
agriculture
```

### Construction And Housing

Useful for real-estate, CAPEX, regional development, and infrastructure Delphi
sessions.

Possible data:

- housing commissioning
- construction volume
- primary housing prices
- secondary housing prices
- construction cost indices
- regional housing market indicators

Practical package:

```text
housing
```

### Trade And Services

Useful for demand forecasting, consumer activity, retail networks, and service
market sessions.

Possible data:

- retail trade turnover
- paid services to population
- catering turnover
- wholesale trade
- regional consumer market indicators

Practical package:

```text
trade-services
```

### Macroeconomics

Useful for high-level planning and scenario context.

Possible data:

- GDP / GRP
- investment in fixed capital
- financial results of organizations
- public finance indicators
- money and credit indicators where exposed through Fedstat references
- external-sector control indicators where linked from Rosstat/Fedstat pages

Practical package:

```text
macro
```

## Recommended WeOracle Integration

For WeOracle, Rosstat data should be used as a baseline, not as the expert
answer itself.

Recommended flow:

1. Pick a data package, for example `fuel-prices`.
2. Fetch Rosstat/Fedstat baseline data.
3. Store a normalized snapshot in D1/KV or in `src/lib/server/data` for static
   fixtures.
4. Create or update a WBD session with:
   - title
   - description
   - assumptions
   - source metadata
   - questions derived from the baseline
5. Experts estimate future deviation/range:
   - optimistic
   - realistic
   - pessimistic
   - confidence
   - rationale
6. The UI shows:
   - source name
   - source URL
   - observation date
   - region
   - baseline value
   - expert consensus corridor

For the current public fuel session, the first target should be:

```text
Rosstat fuel baseline -> D1 seed -> WBD questionnaire questions -> Delphi chart
```

## Storage Plan

Recommended storage under `src/lib/server/data`:

```text
src/lib/server/data/json/rosstat/index.json
src/lib/server/data/json/rosstat/fuel-prices/index.json
src/lib/server/data/json/rosstat/fuel-prices/russia.json
src/lib/server/data/json/rosstat/fuel-prices/regions.json
src/lib/server/data/xml/rosstat/fedstat-31074.sdmx.xml
src/lib/server/data/xlsl/rosstat/fedstat-31074.xlsx
```

Note: the existing folder is named `xlsl`, not `xlsx`. Follow the existing
folder name unless the project intentionally renames it.

## Known Limitations

- Fedstat often responds slowly.
- Indicator HTML can be slow to load.
- Internal filter ids can change or be difficult to extract.
- A universal parser is risky; important indicators should have pinned fixtures.
- Some data is easier to obtain from Rosstat XLS/XLSX publication pages than from
  Fedstat SDMX.
- For production usage, cache aggressively in KV/D1 and show source timestamps in
  the UI.

## Sources

- Fedstat indicator pages: `https://www.fedstat.ru/indicator/{indicatorId}`
- Fedstat data endpoint: `https://www.fedstat.ru/indicator/data.do`
- Rosstat prices and inflation: `https://rosstat.gov.ru/statistics/price`
- Rosstat open data: `https://rosstat.gov.ru/opendata`
- Unofficial Fedstat API reference: `https://github.com/DenchPokepon/fedstatAPIr`
- Fedstat API R manual: `https://stat.ethz.ch/CRAN/web/packages/fedstatAPIr/refman/fedstatAPIr.html`
