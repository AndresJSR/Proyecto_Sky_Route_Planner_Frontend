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
│   │   ├── Auth
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── CardFour.tsx
│   │   ├── CardOne.tsx
│   │   ├── CardThree.tsx
│   │   ├── CardTwo.tsx
│   │   ├── ChartFour.tsx
│   │   ├── ChartOne.tsx
│   │   ├── ChartThree.tsx
│   │   ├── ChartTwo.tsx
│   │   ├── ChatCard.tsx
│   │   ├── CheckboxFive.tsx
│   │   ├── CheckboxFour.tsx
│   │   ├── CheckboxOne.tsx
│   │   ├── CheckboxThree.tsx
│   │   ├── CheckboxTwo.tsx
│   │   ├── DarkModeSwitcher.tsx
│   │   ├── DataStats.tsx
│   │   ├── DropdownDefault.tsx
│   │   ├── DropdownMessage.tsx
│   │   ├── DropdownNotification.tsx
│   │   ├── DropdownUser.tsx
│   │   ├── GenericTable.tsx
│   │   ├── Header.tsx
│   │   ├── MapOne.tsx
│   │   ├── ModalSettings.tsx
│   │   ├── SidebarLinkGroup.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SwitcherFour.tsx
│   │   ├── SwitcherOne.tsx
│   │   ├── SwitcherThree.tsx
│   │   ├── SwitcherTwo.tsx
│   │   ├── TableOne.tsx
│   │   ├── TableSettings.tsx
│   │   ├── TableThree.tsx
│   │   ├── TableTwo.tsx
│   │   ├── TaskHeader.tsx
│   │   ├── ui
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── index.ts
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Table.tsx
│   │   └── users
│   │       └── UserFormValidator.tsx
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
│   ├── interceptors
│   │   └── authInterceptors.ts
│   ├── js
│   │   ├── drag.ts
│   │   └── us-aea-en.js
│   ├── layout
│   │   └── DefaultLayout.tsx
│   ├── lib.d.ts
│   ├── main.tsx
│   ├── models
│   │   ├── Country.ts
│   │   ├── Post.ts
│   │   ├── Role.ts
│   │   ├── skyroute
│   │   │   ├── api.types.ts
│   │   │   ├── graph.types.ts
│   │   │   ├── interruption.types.ts
│   │   │   ├── planner.types.ts
│   │   │   └── report.types.ts
│   │   └── User.ts
│   ├── pages
│   │   ├── Authentication
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   ├── Calendar.tsx
│   │   ├── Chart.tsx
│   │   ├── Countries
│   │   │   └── List.tsx
│   │   ├── Dashboard
│   │   │   └── ECommerce.tsx
│   │   ├── Demo.tsx
│   │   ├── Form
│   │   │   ├── FormElements.tsx
│   │   │   └── FormLayout.tsx
│   │   ├── Post
│   │   │   └── List.tsx
│   │   ├── Profile.tsx
│   │   ├── Roles
│   │   │   └── List.tsx
│   │   ├── Settings.tsx
│   │   ├── SkyRoute
│   │   │   ├── AdvancedTrip
│   │   │   │   ├── AdvancedTripPage.css
│   │   │   │   ├── AdvancedTripPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── BasicPlanner
│   │   │   │   ├── BasicPlannerPage.css
│   │   │   │   ├── BasicPlannerPage.tsx
│   │   │   │   ├── components
│   │   │   │   │   ├── CommonPlannerFilters.tsx
│   │   │   │   │   ├── GraphSummaryPanel.tsx
│   │   │   │   │   ├── ItinerariesPanel.tsx
│   │   │   │   │   ├── ItineraryCard.tsx
│   │   │   │   │   ├── OptimalRoutePanel.tsx
│   │   │   │   │   ├── PageHeader.tsx
│   │   │   │   │   ├── PlannerErrorAlert.tsx
│   │   │   │   │   ├── RouteLegsTable.tsx
│   │   │   │   │   ├── RouteResultCard.tsx
│   │   │   │   │   └── RoutesByCriteriaPanel.tsx
│   │   │   │   ├── constants
│   │   │   │   │   └── plannerOptions.ts
│   │   │   │   ├── hooks
│   │   │   │   │   └── useBasicPlannerPage.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── utils
│   │   │   │       └── plannerFormatters.ts
│   │   │   ├── Dashboard
│   │   │   │   ├── index.ts
│   │   │   │   ├── SkyRouteDashboardPage.css
│   │   │   │   └── SkyRouteDashboardPage.tsx
│   │   │   ├── docs
│   │   │   │   ├── ARCHITECTURE.md
│   │   │   │   └── MIGRATION_PLAN.md
│   │   │   ├── GraphViewer
│   │   │   │   ├── GraphViewerPage.css
│   │   │   │   ├── GraphViewerPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── index.ts
│   │   │   ├── InterruptionHandler
│   │   │   │   ├── index.ts
│   │   │   │   ├── InterruptionHandlerPage.css
│   │   │   │   └── InterruptionHandlerPage.tsx
│   │   │   └── Reports
│   │   │       ├── index.ts
│   │   │       ├── ReportsPage.css
│   │   │       └── ReportsPage.tsx
│   │   ├── Tables.tsx
│   │   ├── UiElements
│   │   │   ├── Alerts.tsx
│   │   │   └── Buttons.tsx
│   │   └── Users
│   │       ├── Create.tsx
│   │       ├── List.tsx
│   │       └── Update.tsx
│   ├── react-app-env.d.ts
│   ├── routes
│   │   └── index.ts
│   ├── satoshi.css
│   ├── services
│   │   ├── countryService.ts
│   │   ├── postService.ts
│   │   ├── SecurityService.ts
│   │   ├── skyroute
│   │   │   ├── api.ts
│   │   │   ├── graphRepository.ts
│   │   │   ├── index.ts
│   │   │   ├── interruptionRepository.ts
│   │   │   ├── plannerRepository.ts
│   │   │   └── reportRepository.ts
│   │   └── userService.ts
│   ├── src
│   │   └── vite-env.d.ts
│   ├── storage
│   │   ├── LocalStorageProvider.tsx
│   │   └── StorageProvider.tsx
│   └── store
│       ├── store.ts
│       └── userSlice.ts
├── tailwind.config.cjs
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.js

53 directories, 245 files
