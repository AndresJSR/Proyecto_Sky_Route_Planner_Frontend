.
├── index.html
├── LICENSE.md
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── public
│   ├── data.json
│   └── favicon.ico
├── README.md
├── server
│   └── main.py
├── src
│   ├── App.tsx
│   ├── common
│   │   └── Loader
│   │       └── index.tsx
│   ├── components
│   │   ├── Breadcrumb.tsx
│   │   ├── DarkModeSwitcher.tsx
│   │   ├── DropdownDefault.tsx
│   │   ├── DropdownMessage.tsx
│   │   ├── DropdownNotification.tsx
│   │   ├── Header.tsx
│   │   ├── SidebarLinkGroup.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TaskHeader.tsx
│   │   └── ui
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── index.ts
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Spinner.tsx
│   │       └── Table.tsx
│   ├── fonts
│   │   ├── Satoshi-Black.eot
│   │   ├── Satoshi-BlackItalic.eot
│   │   ├── Satoshi-BlackItalic.ttf
│   │   ├── Satoshi-BlackItalic.woff
│   │   ├── Satoshi-BlackItalic.woff2
│   │   ├── Satoshi-Black.ttf
│   │   ├── Satoshi-Black.woff
│   │   ├── Satoshi-Black.woff2
│   │   ├── Satoshi-Bold.eot
│   │   ├── Satoshi-BoldItalic.eot
│   │   ├── Satoshi-BoldItalic.ttf
│   │   ├── Satoshi-BoldItalic.woff
│   │   ├── Satoshi-BoldItalic.woff2
│   │   ├── Satoshi-Bold.ttf
│   │   ├── Satoshi-Bold.woff
│   │   ├── Satoshi-Bold.woff2
│   │   ├── Satoshi-Italic.eot
│   │   ├── Satoshi-Italic.ttf
│   │   ├── Satoshi-Italic.woff
│   │   ├── Satoshi-Italic.woff2
│   │   ├── Satoshi-Light.eot
│   │   ├── Satoshi-LightItalic.eot
│   │   ├── Satoshi-LightItalic.ttf
│   │   ├── Satoshi-LightItalic.woff
│   │   ├── Satoshi-LightItalic.woff2
│   │   ├── Satoshi-Light.ttf
│   │   ├── Satoshi-Light.woff
│   │   ├── Satoshi-Light.woff2
│   │   ├── Satoshi-Medium.eot
│   │   ├── Satoshi-MediumItalic.eot
│   │   ├── Satoshi-MediumItalic.ttf
│   │   ├── Satoshi-MediumItalic.woff
│   │   ├── Satoshi-MediumItalic.woff2
│   │   ├── Satoshi-Medium.ttf
│   │   ├── Satoshi-Medium.woff
│   │   ├── Satoshi-Medium.woff2
│   │   ├── Satoshi-Regular.eot
│   │   ├── Satoshi-Regular.ttf
│   │   ├── Satoshi-Regular.woff
│   │   ├── Satoshi-Regular.woff2
│   │   ├── Satoshi-Variable.eot
│   │   ├── Satoshi-VariableItalic.eot
│   │   ├── Satoshi-VariableItalic.ttf
│   │   ├── Satoshi-VariableItalic.woff
│   │   ├── Satoshi-VariableItalic.woff2
│   │   ├── Satoshi-Variable.ttf
│   │   ├── Satoshi-Variable.woff
│   │   └── Satoshi-Variable.woff2
│   ├── hooks
│   │   ├── fireToast.tsx
│   │   ├── useColorMode.tsx
│   │   └── useLocalStorage.tsx
│   ├── images
│   │   ├── brand
│   │   │   ├── brand-01.svg
│   │   │   ├── brand-02.svg
│   │   │   ├── brand-03.svg
│   │   │   ├── brand-04.svg
│   │   │   └── brand-05.svg
│   │   ├── cards
│   │   │   ├── cards-01.png
│   │   │   ├── cards-02.png
│   │   │   ├── cards-03.png
│   │   │   ├── cards-04.png
│   │   │   ├── cards-05.png
│   │   │   └── cards-06.png
│   │   ├── country
│   │   │   ├── country-01.svg
│   │   │   ├── country-02.svg
│   │   │   ├── country-03.svg
│   │   │   ├── country-04.svg
│   │   │   ├── country-05.svg
│   │   │   └── country-06.svg
│   │   ├── cover
│   │   │   └── cover-01.png
│   │   ├── favicon.ico
│   │   ├── icon
│   │   │   ├── icon-arrow-down.svg
│   │   │   ├── icon-calendar.svg
│   │   │   ├── icon-copy-alt.svg
│   │   │   ├── icon-moon.svg
│   │   │   └── icon-sun.svg
│   │   ├── logo
│   │   │   ├── logo-dark.svg
│   │   │   ├── logo-icon.svg
│   │   │   └── logo.svg
│   │   ├── product
│   │   │   ├── product-01.png
│   │   │   ├── product-02.png
│   │   │   ├── product-03.png
│   │   │   ├── product-04.png
│   │   │   └── product-thumb.png
│   │   ├── task
│   │   │   └── task-01.jpg
│   │   └── user
│   │       ├── user-01.png
│   │       ├── user-02.png
│   │       ├── user-03.png
│   │       ├── user-04.png
│   │       ├── user-05.png
│   │       ├── user-06.png
│   │       ├── user-07.png
│   │       ├── user-08.png
│   │       ├── user-09.png
│   │       ├── user-10.png
│   │       ├── user-11.png
│   │       ├── user-12.png
│   │       └── user-13.png
│   ├── index.css
│   ├── js
│   │   ├── drag.ts
│   │   └── us-aea-en.js
│   ├── layout
│   │   └── DefaultLayout.tsx
│   ├── lib.d.ts
│   ├── main.tsx
│   ├── models
│   │   └── skyroute
│   │       ├── api.types.ts
│   │       ├── graph.types.ts
│   │       ├── interruption.types.ts
│   │       ├── planner.types.ts
│   │       └── report.types.ts
│   ├── pages
│   │   └── SkyRoute
│   │       ├── AdvancedTrip
│   │       │   ├── AdvancedTripPage.css
│   │       │   ├── AdvancedTripPage.tsx
│   │       │   ├── components
│   │       │   │   ├── StepActionsPanel.tsx
│   │       │   │   └── TripStatePanel.tsx
│   │       │   ├── hooks
│   │       │   │   └── useAdvancedTripPage.ts
│   │       │   └── index.ts
│   │       ├── BasicPlanner
│   │       │   ├── BasicPlannerPage.css
│   │       │   ├── BasicPlannerPage.tsx
│   │       │   ├── components
│   │       │   │   ├── CommonPlannerFilters.tsx
│   │       │   │   ├── GraphSummaryPanel.tsx
│   │       │   │   ├── ItinerariesPanel.tsx
│   │       │   │   ├── ItineraryCard.tsx
│   │       │   │   ├── OptimalRoutePanel.tsx
│   │       │   │   ├── PageHeader.tsx
│   │       │   │   ├── PlannerErrorAlert.tsx
│   │       │   │   ├── RouteLegsTable.tsx
│   │       │   │   ├── RouteResultCard.tsx
│   │       │   │   └── RoutesByCriteriaPanel.tsx
│   │       │   ├── constants
│   │       │   │   └── plannerOptions.ts
│   │       │   ├── hooks
│   │       │   │   └── useBasicPlannerPage.ts
│   │       │   ├── index.ts
│   │       │   └── utils
│   │       │       ├── plannerFormatters.ts
│   │       │       └── transportValidation.ts
│   │       ├── Dashboard
│   │       │   ├── index.ts
│   │       │   ├── SkyRouteDashboardPage.css
│   │       │   └── SkyRouteDashboardPage.tsx
│   │       ├── docs
│   │       │   ├── ARCHITECTURE.md
│   │       │   └── MIGRATION_PLAN.md
│   │       ├── GraphViewer
│   │       │   ├── components
│   │       │   │   ├── AirportDetailsPanel.tsx
│   │       │   │   ├── GraphSummaryPanel.tsx
│   │       │   │   ├── GraphVisualization.css
│   │       │   │   ├── GraphVisualizationPanel.tsx
│   │       │   │   ├── PageHeader.tsx
│   │       │   │   └── RouteDetailsPanel.tsx
│   │       │   ├── GraphViewerPage.css
│   │       │   ├── GraphViewerPage.tsx
│   │       │   ├── hooks
│   │       │   │   └── useGraphViewer.ts
│   │       │   └── index.ts
│   │       ├── index.ts
│   │       ├── InterruptionHandler
│   │       │   ├── components
│   │       │   │   ├── BlockedRoutesTable.tsx
│   │       │   │   ├── BlockRouteForm.tsx
│   │       │   │   ├── InterruptionHandlerPage.tsx
│   │       │   │   └── InterruptionSummaryCards.tsx
│   │       │   ├── hooks
│   │       │   │   └── useInterruptionHandlerPage.ts
│   │       │   ├── index.ts
│   │       │   ├── InterruptionHandlerPage.css
│   │       │   └── InterruptionHandlerPage.tsx
│   │       └── Reports
│   │           ├── index.ts
│   │           ├── ReportsPage.css
│   │           └── ReportsPage.tsx
│   ├── react-app-env.d.ts
│   ├── routes
│   │   └── index.ts
│   ├── satoshi.css
│   ├── services
│   │   └── skyroute
│   │       ├── api.ts
│   │       ├── graphRepository.ts
│   │       ├── index.ts
│   │       ├── interruptionRepository.ts
│   │       ├── interruptionService.ts
│   │       ├── plannerRepository.ts
│   │       └── reportRepository.ts
│   ├── storage
│   │   ├── LocalStorageProvider.tsx
│   │   └── StorageProvider.tsx
│   └── vite-env.d.ts
├── tailwind.config.cjs
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.js

46 directories, 203 files
