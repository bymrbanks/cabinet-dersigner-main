Thanks for clarifying! I’ll draft a full working plan, technical structure, and feature breakdown for building a realistic, procedural 3D cabinet designer with React and Three.js. I'll include how to handle user customization, visuals like lighting and shadows, design exporting, and generating a cut-list feature.

I'll get back to you shortly with a detailed execution roadmap!

# Procedural 3D Cabinet Designer – Technical Plan and Roadmap

## Project Overview 
This project is a **web-based 3D cabinet design application** that allows users to **procedurally generate custom cabinets** for kitchen or bathroom layouts. Built with **React.js** and **Three.js**, the app will run in the browser (optimized for desktop) with no login required. Users can specify cabinet dimensions (width, depth, height) and type (base cabinet or wall-mounted top cabinet), and interactively add, remove, or resize cabinet doors and drawers. The 3D visualization will update in real-time with **realistic materials, lighting, and shadows**, drawing inspiration from the high-quality, cozy style of the *Tiny Glade* game. The application will enable saving and exporting designs as image snapshots, 3D model files (GLTF/OBJ), and as a structured JSON specification. It will also generate a **cut-list** – a detailed list of panel dimensions and materials – to assist in manufacturing the designed cabinet. The following plan outlines the technology stack, architecture, component design, rendering techniques, state management, and a step-by-step execution roadmap.

## Features and Requirements 
The application will implement the following key features to meet the requirements:

- **Parametric Cabinet Dimensions:** Users input the **width, depth, and height** of the cabinet, as well as specify if it’s a **base (floor) cabinet or a wall-mounted top cabinet**.
- **Dynamic Doors and Drawers:** Users can **add or remove doors and drawers**, and adjust their sizes. The front face of the cabinet can be configured into one or multiple doors and/or drawers. These changes happen interactively, updating the 3D model.
- **Auto-Adjusting Internal Structure:** The cabinet’s internal structure (such as vertical dividers, shelves, or horizontal supports) **updates automatically** based on the door/drawer configuration. For example, adding multiple drawers will introduce the appropriate horizontal separators or compartments, and a two-door cabinet will include a central divider and individual shelves for each section.
- **Realistic 3D Visualization:** The cabinet is rendered with **high-quality visuals** – realistic wood or painted materials, appropriate metallic hardware, and convincing lighting/shadow effects. The style will be similar to *Tiny Glade*’s cozy realism: soft lighting, global illumination-like effects, and attention to materials.
- **User Interaction:** The 3D view will support **orbit controls** (drag to rotate, zoom, pan) for inspecting the design from different angles. The UI will include a clean control panel for parameters (dimensions, add/remove components) and possibly gizmos or handles for direct manipulation (optional).
- **Export Options:** Users can **save or export** their cabinet designs in multiple formats:
  - **Image**: Capture a screenshot of the 3D canvas as a PNG/JPEG image.
  - **3D Model**: Export the cabinet as a 3D model file (GLTF/GLB is preferred; OBJ could be provided as an alternative) for use in other 3D programs.
  - **JSON Specification**: Download a JSON file containing the cabinet’s specifications (dimensions and configuration), which can be re-imported or used for further processing.
- **Cut-List Generation:** The app produces a **cut list** – a detailed material list of all cabinet parts (panels, shelves, doors, drawer fronts, etc.) with their dimensions (length × width × thickness). This is geared toward woodworking/manufacturing, so that a user or a CNC machine operator knows exactly what pieces to cut and their sizes.
- **No Authentication, Desktop Optimized:** The tool will be accessible publicly without login. The UI will be optimized for desktop usage (assuming ample screen space for the 3D view and control panel), though it will still be built with responsive design principles in case of different screen sizes.

## Technology Stack and Libraries 
To fulfill these requirements, we will utilize a modern web tech stack centered on React and Three.js, along with supportive libraries for state management and UI. Below are the key technologies and libraries, and why they are chosen:

- **React.js:** Provides a robust framework for building the user interface in a modular way. React will handle the overall application structure and the UI controls. Specifically, we will use **React 18+** to leverage modern features and pair with the React-based Three.js renderer (React Three Fiber) ([Introduction - React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction#:~:text=React,js)).
- **Three.js:** The core 3D engine for rendering the cabinet. Three.js offers low-level control over 3D objects, materials, lights, and cameras. We will use Three.js via React Three Fiber to describe the scene declaratively in React. All geometry generation and material assignments will use Three.js classes under the hood.
- **React Three Fiber (R3F):** A React renderer for Three.js that allows us to build the 3D scene with JSX components and reactive state. This enables treating 3D objects as React components, which improves reusability and integration with React’s state and props ([Introduction - React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction#:~:text=Build%20your%20scene%20declaratively%20with,can%20participate%20in%20React%27s%20ecosystem)). R3F introduces no performance overhead compared to plain Three.js and integrates seamlessly with the React app lifecycle ([Introduction - React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction#:~:text=Is%20it%20slower%20than%20plain,Threejs)). Using R3F gives access to the rich ecosystem of React-based 3D tools, making it easier to achieve good visuals and reuse community components ([Procedural/Parametric furniture in Threejs - Questions - three.js forum](https://discourse.threejs.org/t/procedural-parametric-furniture-in-threejs/68760#:~:text=it%20exists%20x)).
- **@react-three/drei:** A helper library (often called “drei”) that provides useful premade components for React Three Fiber. We will use Drei for things like:
  - **OrbitControls** (for camera orbit interaction),
  - **Environment** maps and possibly **skyboxes** or **HDRI lighting** setups,
  - **ContactShadows** or **soft shadow helpers**,
  - Other utilities (e.g. `<Text>` for labels, if needed, or <OrthographicCamera> if we switch camera types).
  Drei greatly simplifies adding common 3D features so we don’t have to write them from scratch.
- **State Management (Zustand or Redux):** For managing the cabinet’s configuration state, we will use a global state store. **Zustand** is a strong candidate due to its simplicity and minimal boilerplate. Zustand (German for “state”) is a small (~2KB) but **fast and scalable state-management library** with an easy hook-based API ([Zustand: The Simplest and Most Scalable React State Management Tool You’re Not Using (Yet) | by CodeByUmar | Apr, 2025 | JavaScript in Plain English](https://cody-by-umar.medium.com/zustand-the-simplest-and-most-scalable-react-state-management-tool-youre-not-using-yet-8b23398b734d#:~:text=Meet%20Zustand%20%E2%80%94%20a%20small%2C,React%20feel%20almost%20too%20easy)) ([Zustand: The Simplest and Most Scalable React State Management Tool You’re Not Using (Yet) | by CodeByUmar | Apr, 2025 | JavaScript in Plain English](https://cody-by-umar.medium.com/zustand-the-simplest-and-most-scalable-react-state-management-tool-youre-not-using-yet-8b23398b734d#:~:text=Zustand%20,It%20was%20created%20by%E2%80%A6)). It integrates well with React and even React Three Fiber (R3F itself uses Zustand internally) ([How to use state management with react-three-fiber without ...](https://discourse.threejs.org/t/how-to-use-state-management-with-react-three-fiber-without-performance-issues/61223#:~:text=How%20to%20use%20state%20management,in%20terms%20of%20bundle%20size)). This means we can store the cabinet parameters (dimensions, components list, etc.) in a central store and any component (UI controls or 3D objects) can subscribe to it. Redux is another option known for predictability; however, for this project Redux’s extra boilerplate may not be necessary. Zustand’s fluid API will likely speed up development and keep code concise. (If organizational policies prefer Redux, the plan can adapt accordingly, structuring state as reducers/actions, but we will proceed with Zustand for this roadmap).
- **Three.js Addons:** We will use certain Three.js add-ons or utilities for exporting models:
  - **GLTFExporter:** to export the scene or specific cabinet object to glTF2.0 format. Three.js’s GLTFExporter can generate a `.gltf` (JSON) or `.glb` (binary) from a given scene or mesh, which we can then offer as a downloadable file ([threejs.org](https://threejs.org/docs/examples/en/exporters/GLTFExporter.html#:~:text=,options%20%29%3B)) ([threejs.org](https://threejs.org/docs/examples/en/exporters/GLTFExporter.html#:~:text=%2A%20%60trs%60%20,be%20included%20in%20the%20export)).
  - **OBJExporter:** (optional) to support OBJ format if needed, though glTF will cover most needs. OBJ export is simpler (geometry + materials) and could be provided for compatibility.
- **UI Component Library:** For building the control panel and inputs, we want a clean and responsive UI. We have a couple of approaches:
  - **Leva** – a React-based GUI panel library specifically made for tweaking variables in interactive apps. Leva can provide ready-to-use sliders, number inputs, toggles, and color pickers with minimal code ([Leva - React Three Fiber Tutorials](https://sbcode.net/react-three-fiber/leva/#:~:text=There%20are%20many%20Leva%20GUI,and%20subfolders%20and%20hide%2Fshow%20them)). It’s great for quickly hooking up the cabinet parameters to a panel for live editing, which is useful during development and could also be exposed to end-users for an “advanced controls” interface.
  - **Radix UI Primitives** – an unstyled, accessible component library for React that provides building blocks like sliders, dialog boxes, dropdowns, etc., which we can style as needed ([Radix Primitives](https://www.radix-ui.com/primitives#:~:text=Core%20building%20blocks%20for%20your,design%20system)). Radix would be useful to create a polished, custom-designed control panel that matches our app’s theme while ensuring accessibility and good UX.
  - We may also use standard component libraries like **Material-UI** or **Chakra UI** for basic form inputs if needed, but Leva and Radix specifically give us either quick-out-of-the-box controls or the flexibility to craft our own UI. In this plan, we’ll suggest starting with **Leva** for rapid development of the controls (as it requires almost zero setup to bind to state), and later possibly moving to a custom UI using Radix primitives for a more branded look.
- **Other Tools and Libraries:**
  - **Three.js Math/Geometry Utilities:** We will utilize Vector3, Box3, etc., for calculations (like positioning components, computing sizes).
  - **React useEffect and useMemo:** to efficiently update three.js geometry when state changes, and to avoid expensive computations on every frame.
  - **Loading and Optimization Libraries:** If we include texture images (for wood grain, etc.), we might use Three’s TextureLoader or R3F’s useTexture hook. Also, if the scene gets complex, we might consider using techniques like instancing, but for a single cabinet the polycount will be low.
  - **Bundler/build tool:** Likely **Vite** or **Create React App** for setup (Vite for faster dev server). The code will be written in modern JavaScript (or TypeScript if we choose, for type safety) and bundled for the web.

By leveraging this stack, we ensure we have a productive development environment and a performant, feature-rich application. React + R3F gives us a declarative and reactive way to manage the scene, Zustand provides easy state synchronization, and Three.js ensures we can achieve the required graphical realism.

## Application Architecture and Code Structure 
We will organize the codebase in a modular and scalable way, separating concerns for 3D rendering, state logic, and UI. Below is a proposed **folder structure** for the project (within the `src/` directory), along with the responsibilities of each module:

```
src/
├── components/
│   ├── canvas/                # React Three Fiber Canvas and 3D scene components
│   │   ├── Scene.jsx          # Sets up Canvas, camera, lights, and global 3D context
│   │   ├── Cabinet.jsx        # Main cabinet component that assembles all parts
│   │   ├── CabinetBody.jsx    # Sub-component for the cabinet box/carcass (sides, bottom, top, back)
│   │   ├── Door.jsx           # Sub-component for a door (geometry + hinge positioning)
│   │   ├── Drawer.jsx         # Sub-component for a drawer front panel
│   │   ├── Shelf.jsx          # Sub-component for a shelf or horizontal partition
│   │   └── Handle.jsx         # Sub-component for a handle/knob (could be simple geometry or model)
│   └── ui/                   # UI controls and panels
│       ├── ControlsPanel.jsx  # The sidebar or overlay containing input controls (dimensions, add/remove buttons)
│       ├── DimensionInputs.jsx# Sub-component for dimension inputs group
│       ├── ComponentList.jsx  # UI for listing doors/drawers and resizing them
│       └── ExportButtons.jsx  # UI for export/download actions (image, model, JSON, cutlist)
├── state/
│   └── useCabinetStore.js     # Zustand store (or Redux slice) for cabinet state (dimensions, structure, etc.)
├── utils/
│   ├── geometry.js            # Utilities for geometry calculations (e.g., creating panels, updating positions)
│   ├── export.js              # Functions to handle GLTF/OBJ export using Three.js exporters
│   └── cutlist.js             # Function to generate cut-list data from the cabinet state
├── assets/
│   ├── textures/              # Textures for materials (wood grain, etc.)
│   └── environment.hdr        # HDR environment map for realistic lighting (if used)
├── App.jsx                    # Main React app, sets up canvas and UI layout
└── index.js                   # React DOM render entry point
```

**Key Architectural Points:**

- The **App.jsx** will likely include the `<Canvas>` from React Three Fiber (possibly encapsulated in `Scene.jsx`) and the UI panels. We might structure it as a split view: a large canvas area and a sidebar of controls.
- All 3D-related components are under `components/canvas`. These are React components that return Three.js objects via JSX (using R3F). For example, `Cabinet.jsx` when rendered will produce a Three.js Group that contains instances of `CabinetBody`, `Door`, `Drawer`, etc., assembled into one cabinet model.
- Each part of the cabinet (door, drawer, shelf, etc.) is a **self-contained component**. They accept props such as dimensions (width, height, thickness) and position, and internally they generate the appropriate Three.js geometry (likely a `<mesh>` with a `<boxGeometry>` or planes) and material. This modular approach follows React’s component principles and makes it easy to modify one part’s implementation without affecting others. It also aligns with best practices of file structure where each component and its sub-components are isolated and reusable ([Rules for React three fiber | Cursor Directory](https://cursor.directory/rules/react-three-fiber#:~:text=lowercase%20with%20dashes%20for%20directories,Prioritize%20error)).
- The `Cabinet.jsx` component acts as an **orchestrator**: it retrieves the current cabinet configuration from the state store (via a Zustand hook or via Redux connect) and then conditionally renders the correct number of Door and Drawer components, as well as the cabinet body panels. It passes down the calculated dimensions/positions to each. For example, if the state indicates two drawers, `<Cabinet>` will render two `<Drawer>` children with appropriate size and placement.
- The `state/useCabinetStore.js` defines the shape of the global state. In Zustand, this might look like: 
  ```js
  const useCabinetStore = create((set) => ({
    width: 800,  // default values in mm (for example)
    height: 720,
    depth: 600,
    type: 'base', // or 'wall'
    frontStructure: {
      // Example structure representation
      columns: 1,
      rows: 2,
      layout: [ 
         { type: 'drawer', heightRatio: 0.4 }, 
         { type: 'door', heightRatio: 0.6 } 
      ]
    },
    // derived properties like number of doors/drawers can be computed from frontStructure
    updateDimension: (dim, value) => set({ [dim]: value }),
    addDrawer: () => { ... },
    removeComponent: (index) => { ... },
    // etc.
  }));
  ```
  The above is a conceptual example where `frontStructure` might hold how the front of the cabinet is split. In this case, it has 1 column and 2 rows: perhaps a drawer occupying 40% height at the top and a door for the remaining 60% below, as one possible configuration. The state will also include *mutator functions* (for Zustand) like `addDrawer`, `removeDoor`, etc., that update the structure. In Redux, similarly, we’d define actions (ADD_DRAWER, REMOVE_DRAWER, etc.) and a reducer to manage a similar state shape.
- The `utils/geometry.js` will contain helper functions that, given the state, compute geometry or positions. For instance, a function `calculatePanelDimensions(state)` could return all panel sizes. Another could generate a Three.js `BufferGeometry` for a custom-shaped panel if needed. This separation of logic makes testing easier (logic vs rendering).
- The `utils/export.js` will wrap Three.js’s GLTFExporter usage. For example, an `exportGLTF(scene)` function that uses `GLTFExporter.parse()` to get the glTF and triggers a download. Similarly, `exportJSON(state)` would format the JSON spec.
- The `utils/cutlist.js` will take the cabinet’s state (or we might pass in a fully calculated list of parts) and compute an array of parts with dimensions. We might define a standard list of parts like: sides, bottom, top, back, shelves, door panels, drawer fronts, etc. For each, calculate width × height (and we know thickness from a constant or state). For example, side panel height = cabinet height, side panel depth = cabinet depth, quantity = 2. This utility returns data that can then be shown in a table or exported as CSV/JSON. 

**Data Flow:** The data (state) flows primarily from the **Zustand store** to the components. The UI controls will call state update functions when the user changes a value (e.g., typing a new width or clicking "Add Drawer"), and those changes trigger re-renders in the React components. Because R3F components subscribe to state, they will react to the changes and update the Three.js scene accordingly. This unidirectional data flow keeps things predictable: the state is the single source of truth for the cabinet configuration. 

**Rendering Loop:** Notably, with React Three Fiber, we don’t need to manually write a render loop – R3F will bind into React’s render cycle and Three.js’s requestAnimationFrame under the hood. Components can use `useFrame` if continuous animation or checks are needed (e.g., for something rotating or for maybe a subtle animation), but in our case most of the scene is static unless user is interacting. We may use `useFrame` to smoothly animate transitions if we allow resizing doors/drawers via drag, but otherwise it’s mostly static updates.

This architecture ensures **separation of concerns**: UI vs 3D vs logic are decoupled, and each part can be developed and tested in isolation. The folder structure with clear labels (canvas vs ui vs utils vs state) makes it easy for multiple contributors to work on different aspects (for example, one can focus on improving the 3D materials while another works on the control panel UI, with minimal conflicts).

## 3D Rendering Setup (Camera, Lighting, and Shadows) 
Achieving a realistic and appealing visual result is a major goal. We will set up the Three.js scene with proper camera settings, lighting configuration, and material choices:

- **Canvas and Renderer:** We will create the Three.js renderer via R3F’s `<Canvas>` component, enabling anti-aliasing for smooth edges and turning on the **shadow map**. For example: 
  ```jsx
  <Canvas shadows dpr={[1, 2]} camera={{ position: [2, 2, 2], fov: 50 }}>
    ... 
  </Canvas>
  ```
  Here, `shadows` enables shadow rendering, and `dpr` sets device pixel ratio (we allow up to 2 for high-DPI screens, balancing clarity with performance). The camera is a perspective camera positioned at an angle to view the cabinet (exact position will be tuned; e.g., initial position might be in front of the cabinet and slightly above, looking down at it).
- **Camera Controls:** Using Drei’s `<OrbitControls>` we allow the user to orbit around the cabinet, zoom in/out, and pan. We will set the control target to the center of the cabinet so it orbits around it. We can limit the polar angle for a floor cabinet (so camera doesn’t go below ground). For top cabinets, maybe allow looking from below as well. The controls make the 3D interaction intuitive.
- **Lighting Setup:** To get a realistic look, we’ll employ a combination of environment lighting and direct lights:
  - **Environment Map (Image-Based Lighting):** We will use an HDR environment map (for example, a studio lighting or an outdoor sky HDR image) via Drei’s `<Environment>` component. This provides ambient light and realistic reflections on surfaces. Using an environment map often produces more realism than multiple manual lights and is efficient to render ([Environment Maps - Three.js Tutorials](https://sbcode.net/threejs/environment-maps/#:~:text=needed%20during%20the%20render%20of,each%20frame)). The environment map gives subtle global illumination-like effects (soft lighting from all directions) and will make materials like metal handles reflect the surroundings slightly.
  - **Key Light (Directional Light):** We will add a primary **Directional Light** acting like the sun or a soft spotlight in a studio. For instance, a directional light at an angle (e.g., coming from the top-front-left of the scene) to cast shadows onto the cabinet. This light will have shadows enabled (`castShadow = true`), and we will tune the shadow camera bounds to tightly cover the cabinet for high-resolution shadows. The light’s intensity and color will be adjusted to complement the environment light (for example, a neutral white light, or a warm tone if mimicking indoor lighting).
  - **Fill Light/Ambient Light:** In addition to environment, a low-intensity **Ambient Light** can ensure no part of the cabinet is completely dark. Alternatively, a **Hemisphere Light** (with a sky color and ground color) can simulate diffuse sky and ground bounce lighting, which works well for outdoor-like lighting.
  - We may place other minor lights if needed – e.g., a **spotlight** to highlight the front of the cabinet if the environment is dark, or point lights to simulate room lights. But we must balance so as not to create multiple overlapping shadows or overly complicate lighting. One directional + environment is usually sufficient for a realistic baseline.
- **Shadows:** Both the cabinet and the ground will receive and cast shadows. We will include a ground plane (invisible or subtly visible) to catch shadows under the cabinet. Possibly use Drei’s `<ContactShadows>` to create a nice soft shadow under the cabinet (this is an effect that computes a blurred shadow beneath an object). If using a physical ground plane, we’ll make it large enough and set `receiveShadow = true`. All cabinet parts (meshes) will set `castShadow = true` and `receiveShadow = true` so they self-shadow appropriately (for example, shelves inside might be shadowed).
- **Materials:** All cabinet parts will use **physically-based materials** (Three.js `MeshStandardMaterial` or `MeshPhysicalMaterial`) for realism. We will configure materials as follows:
  - **Cabinet Panels (Wood or Painted):** Likely use a `MeshStandardMaterial` with a texture map for wood grain or a flat color with some roughness and maybe a slight metallic sheen if painted. We will adjust roughness/metalness to mimic real cabinet finish (most likely a semi-matte diffuse). If we include a wood texture, we’ll ensure proper UV mapping so it doesn’t stretch when dimensions change. Alternatively, we can use plain colors initially and add texture later.
  - **Handles/Hardware:** Use a `MeshStandardMaterial` with a metallic setting (metalness = 1, roughness ~0.4 for a brushed metal look, for instance). This will make the handles reflect the environment map nicely, appearing like metal.
  - **Floor (for visualization):** If we include a visible floor plane, give it a neutral material (gray or a simple concrete texture) so the cabinet doesn’t float in black space. This along with environment light will situate the cabinet in a plausible scene.
  - **Advanced Effects:** For an extra touch of realism inspired by *Tiny Glade*, we can consider screen-space global illumination or ambient occlusion. Three.js now has some post-processing effects (via Drei or other libraries) like **SSAO** (ambient occlusion) or even a real-time **SSGI** (global illumination) effect. In fact, there’s a community effort called `realism-effects` that provides SSGI and other enhancements for Three.js ([Making the scene more realistic - Questions - three.js forum](https://discourse.threejs.org/t/making-the-scene-more-realistic/61051#:~:text=GitHub%20,Effects%20to%20enhance)). Integrating those could yield softer indirect lighting (for example, interior of the cabinet would get some light bounce). We should plan this as an optional enhancement if performance allows, as these effects can be GPU intensive. For the initial implementation, high-quality baked lighting from an environment HDR and a good shadow might suffice. 
- **Camera Settings:** Use a perspective camera with a somewhat moderate field of view (around 50-60°) to avoid extreme distortion. Ensure that the camera’s near/far planes encapsulate the cabinet size (near ~10 units to avoid clipping if camera gets very close, far maybe 1000 or so, but since scene is small we keep it tight for depth precision).
- **Tone Mapping and Output:** Three.js allows tone mapping for HDR lighting. We may use ACESFilmic tone mapping and adjust exposure so that the lighting looks natural (not too dark or blown out). Also set `renderer.outputEncoding = sRGBEncoding` to ensure correct color space so that colors and textures appear as intended.
- **Performance Considerations:** The scene is relatively simple (one cabinet), so we can afford high-quality settings. We will use `PMREMGenerator` internally via `<Environment>` for the HDR to ensure reflections look correct. Shadow map resolution can be set high (e.g., 2048 or 4096) for crisp shadows, given only one main shadow-casting light. We will monitor performance; since it’s desktop-focused, a decent GPU should handle it easily, but we’ll still optimize where possible (for example, not rendering shadows for very small parts if unnecessary, or culling objects that are not visible – R3F/Three.js do frustum culling by default for meshes).

With this rendering setup, we expect to achieve a realistic looking cabinet model on screen. The combination of an environment map for global illumination and a key light for shadows will give us a balance of performance and visual quality. **Figure 1** below shows an example of a realistic kitchen scene achieved with Three.js – we aim for a similar level of realism for our single cabinet (high-quality lighting, shadows on the floor, and PBR materials):

 ([Making the scene more realistic - Questions - three.js forum](https://discourse.threejs.org/t/making-the-scene-more-realistic/61051)) *Figure 1: Example of a realistic rendering of cabinets and kitchen objects in Three.js (with proper lighting and materials). Our application will employ environment lighting and shadows to achieve a comparable realistic look.*

*(Figure note: The image above demonstrates the effect of environment mapping and good lighting – notice the soft reflections on the floor and realistic shading on the cabinets. In our app, using an HDR environment and calibrated lights will produce a similarly realistic style.)*

## State Management and Cabinet Data Model 
Managing the state of the cabinet (its dimensions and composition) is central to this app. We will maintain a structured state that can be easily updated and that drives both the UI and the 3D components. 

**Global State Store:** Using **Zustand**, we’ll create a store that holds the cabinet’s parameters and provides setter functions. This store is essentially a singleton state object for the app. Any React component can use the `useCabinetStore` hook to read or modify state. (With Redux, this would be a slice of the global Redux store with corresponding actions and selectors.) 

**State Structure:** We need to represent all aspects of the cabinet. Key fields in the state might include:
- `width`, `height`, `depth` (numeric values, likely in millimeters or inches – we should decide on a unit and be consistent, possibly allow toggling units in the UI).
- `type` (string or enum: `"base"` or `"wall"`). The type might affect defaults like whether it has a toe-kick or not, or how tall it typically is, etc.
- `components` or `sections` – this will describe the front face breakdown (doors and drawers). We need a flexible structure for this. One approach:
  - Use an array to represent vertical sections (stacked from top to bottom). Each element could be an object like `{ type: 'drawer', height: 200, ... }` or `{ type: 'door', height: 500, double: true }`. If we allow multiple columns (like two doors side by side), we might include that info as well, perhaps as an array of columns within each row.
  - Alternatively, maintain separate counts like `numDrawers` and `numDoors` and some pattern, but that’s less flexible for arbitrary arrangements.
  - A more structured approach: `frontStructure: { columns: 1 or 2, rows: N, layout: [ { type, span? } ... ] }`. For example, `columns: 2` and `rows: 1` with `type: 'door'` would imply a two-door side-by-side cabinet. `columns: 1, rows: 3` with a layout like `[ {type:'drawer', heightRatio:0.2}, {type:'drawer', heightRatio:0.2}, {type:'door', heightRatio:0.6} ]` could represent two small drawers on top of one larger door section.
  - We will decide on a data model that is easiest to manipulate. A hierarchical model might be needed if we let users split one section into two, etc. But for the MVP, a simpler representation and fixed patterns might suffice (like either a stack of drawers or a set of doors).
- `shelves` – we might include a number of shelves for the interior of a door cabinet. Or we can derive shelf count from other parameters (e.g., a single-door or double-door cabinet might default to one shelf).
- Possibly boolean flags like `hasToeKick` (for base cabinets – a recessed bottom area) if we want to model that. We haven’t specified toe-kick explicitly, but base cabinets often have it. It could be a static design element (like 100mm recess at bottom). We can include this in the design for completeness.

**State Example:** 
```js
{
  width: 900,
  height: 720,
  depth: 600,
  type: 'base',
  structure: {
    columns: 1,
    sections: [
      { type: 'drawer', height: 150 },
      { type: 'drawer', height: 150 },
      { type: 'drawer', height: 150 },
      { type: 'drawer', height: 150 }
    ]
  },
  // This example would be a base cabinet with 4 equal drawers of 150mm height each (assuming total height ~720mm allowing some toe-kick or top board).
}
```

**Derived Data:** Some values can be computed on the fly instead of stored:
- If `columns: 2` (two-door scenario), each door’s width = `width/2 - gap`. We might not store each door’s width explicitly if it’s always symmetrical, just compute when rendering.
- Total number of doors or drawers can be counted from the structure array.
- If we need each part’s dimensions, we might compute those in the cutlist function rather than store in state.

**Mutations and Reactions:** 
- Actions like `addDrawer` will modify the `structure`. For example, if there’s currently a door taking full height, and the user chooses to add a drawer, we could replace that door section with a smaller door plus a drawer section. Or if there’s a stack of N drawers, add one more drawer (which might involve recalculating heights or making them equal by default).
- We will ensure such state updates also handle the internal structure. For instance, if switching from a door to multiple drawers, we might set a flag to remove shelves (since drawers don’t need shelves but rather need horizontal dividers – which we will model as part of the drawer component perhaps).
- Zustand makes updating easy: e.g., `useCabinetStore.getState().addDrawer()` can internally do the logic and call `set()` to update. After state updates, React components that use the state will automatically re-render. For example, `Cabinet.jsx` will rerender, and inside it might map over `state.structure.sections` to create appropriate Door/Drawer components.

**Performance:** The state updates are generally infrequent (only when user changes something, not every frame), so performance is not a big concern. Zustand updates cause only subscribed components to rerender, which is efficient. And React Three Fiber renders components outside the normal React reconcilation which further helps performance at scale ([Introduction - React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction#:~:text=Is%20it%20slower%20than%20plain,Threejs)). We will still design state updates to be as atomic as possible (update only what’s needed).

**Encapsulation vs. Global State:** While a global store is convenient, we will be careful about not letting it become chaotic. We may encapsulate some state in component local state if it’s not needed globally. However, for something like a single cabinet designer, almost all configuration is global by nature (since everything relates to one cabinet). If in the future we allowed multiple cabinets in one scene, we might refactor the state to handle an array of cabinet objects, each with their own config.

**Undo/Redo (Future consideration):** Redux would make implementing undo/redo easier (with something like redux-undo or simply storing past states). Zustand doesn’t have built-in undo but we could manage a history stack. For now, we won’t explicitly plan this feature, but it’s something to keep in mind given users might appreciate reverting changes. We could add an undo by storing previous state snapshots on each update, but that’s an enhancement beyond the core scope.

In summary, the state management will provide a **single source of truth** for the cabinet’s design. By structuring it clearly and providing well-defined actions to modify it, we ensure that the UI and 3D remain in sync. This approach also simplifies exporting the design as JSON – we can largely take the state object (or a cleaned-up version of it) and serialize it for the JSON output.

## Modular Component Design (Cabinet Parts as Reusable Components) 
To handle the various elements of the cabinet, we will implement a **component-based 3D object system**. Each major part of a cabinet will correspond to a React component (which returns a Three.js mesh or group). This modular design makes the code easier to maintain and extend (for example, adding a new type of door style later would mean adding a new component). Here are the core components and how they function:

- **CabinetBody Component:** This represents the **carcass or box** of the cabinet – typically the fixed parts including:
  - Two side panels (left and right vertical boards),
  - Bottom panel,
  - Top panel (for wall cabinets, definitely; for base cabinets, there might be a top stretchers or if we treat it as having a top for completeness even though in a kitchen a countertop would sit on it – we can include a top panel for generality),
  - Back panel (a thin board),
  - Possibly a toe-kick or base platform (for base cabinets). This could be a cut-out on the front-bottom or a separate piece.
  
  The `CabinetBody` component, when rendered, will create each of these sub-parts as meshes (likely using BoxGeometry for each panel). We could either make each panel a sub-component too (like a generic `Panel` component that takes dimensions), or just create them inside `CabinetBody` since they are simple. For clarity, we might create a helper function to create a panel mesh to avoid repetition. The `CabinetBody` will position these panels correctly relative to the cabinet’s origin. We have to decide the coordinate system: a convenient choice is to have the cabinet’s origin at the **bottom-front-left corner** of the cabinet’s bounding box (the footprint corner). Then:
    - Left side panel starts at origin (0,0,0) and extends upward (y axis) and backward (z axis).
    - Right side panel starts at x = width - thickness, y=0, z=0.
    - Bottom panel at origin (0,0,0) extending to (width, depth) in x-z plane.
    - Top panel at y = height - thickness (for a closed top).
    - Back panel at z = depth - backThickness, spanning the width and height.
  Alternatively, origin at bottom-center might simplify symmetric placement (like placing left/right by ±half width), but then calculations involve half widths. Bottom-front-left is straightforward for building from 0 outwards. We can always center the whole cabinet Group afterwards if needed for rotating around center in view.
  
  `CabinetBody` will take props like `{ width, height, depth, thickness, backThickness }` etc. It might also accept `hasBack, hasTop` booleans in case we allow open-back or frameless designs, but probably always true here.
  
- **Door Component:** Represents a **cabinet door**. This will typically be a flat rectangle (could be modeled as a thin box). The Door component will need to know its width and height (usually it will match the opening it covers, minus perhaps a small gap around edges). If a cabinet has double doors, each door’s width is half of opening minus a gap in the middle. We will incorporate a small reveal gap (say 2-3 mm) around doors/drawers for realism, so they aren’t flush merged. The Door component will create a thin box (thickness maybe 18mm or 0.75") and position it at the front of the cabinet box (i.e., z = 0 if we consider front face at z=0 or maybe slightly proud if doors overlay the carcass).
  
  If we want to later allow different door styles (e.g., shaker frame vs slab), this component could be extended or take a style prop. Initially, it will just be a plain slab door.
  
  The Door component might also include a child component for the **handle** (pull knob). If every door has a handle, we can let Door internally place a Handle sub-component at a certain location (e.g., centered vertically and a set distance from the side edge if it’s a single door, or on the appropriate side if double door – usually handles are on opposite sides of the two doors).
  
- **Drawer Component:** Represents a **drawer front panel**. This is very similar to Door in terms of being a flat panel on the front. The differences: a drawer front is typically shorter in height. Also, if we ever animate, a drawer would slide out rather than swing, but we’re not animating functionality here. The Drawer component again is basically a thin box mesh. It will also likely include a handle (centered on the drawer front typically).
  
  We might combine Door and Drawer into one more general component (like “FrontPanel”) with a type prop, since they share a lot. However, separating them can make it easier to attach different behavior if needed. For now, both will be implemented similarly.
  
- **Shelf Component:** Represents an **internal shelf** board. For a given cabinet configuration, the logic might dictate adding one or more shelves inside. For example, a tall single-door pantry might have multiple shelves, whereas a short base cabinet might have one. We can decide shelf rules: perhaps one shelf for any door section taller than some size, or allow the user to add shelves manually in future.
  
  The Shelf component will essentially be a thin board like the bottom panel, placed at a certain height inside the cabinet. If the cabinet has multiple vertical compartments (like two doors side by side with a divider), we might need to split shelves per compartment or have separate shelf components in each compartment. The state should carry info about shelves count per compartment or a default of one shelf per compartment.
  
- **Handle Component:** Represents a **door or drawer handle/knob**. These could be simple shapes – e.g., a cylinder for a knob or a thin box for a bar handle. We might also import a small premade model of a handle if we want realism. However, generating a simple handle geometry is straightforward. The Handle component would take a position and attach to its parent panel. In practice, we might not use a standalone Handle component in JSX but instead in Door/Drawer’s code do something like `<mesh geometry={cylinderGeo} material={metalMat} position={[...]} />`. If we foresee multiple styles of handles and user choice, a component abstraction could be useful.
  
- **Additional Components:** If modeling a **toe-kick** for base cabinets, that could be a component. A toe-kick is basically a recessed portion of the bottom-front. We can model it as part of the cabinet body: either by having the bottom panel inset or by adding a front strip that’s smaller. Alternatively, have a “ToeKick” component. For now, we might simplify by not modeling detailed toe kicks unless needed.
  
- **Grouping:** All these parts (Door, Drawer, etc.) will ultimately be children of the main Cabinet group (from `Cabinet.jsx`). We might use `<group>` in R3F to group the entire cabinet, allowing us to move or rotate the whole cabinet easily (for example, centering it in the scene or placing multiple cabinets in future).
  
- **Communication Between Components:** The Cabinet component will decide how many Door or Drawer components to render based on state, and their sizes. For example, if state says two doors, Cabinet will render:
  ```jsx
  <Door width={width/2 - gap} height={height - topGap - bottomGap} position={[0,0,0]} hinge="left" />
  <Door width={width/2 - gap} height={height - topGap - bottomGap} position={[width/2 + gap,0,0]} hinge="right" />
  ```
  (assuming origin left-bottom, first door at x=0, second at x=width/2+gap). The Door component might use the `hinge` prop to decide which side to put the handle on. Similarly, if drawers: for N drawers of equal height, each drawer’s height = (available height - totalGaps)/N. We then render N Drawer components at increasing heights.
  
  Internal parts like shelves or vertical dividers: Cabinet can also render those. E.g., if two columns (double door), then a vertical divider panel in the middle. That could be another component or handled inside CabinetBody by passing a `verticalDivider=true`.
  
- **Reactivity:** When the user changes a dimension or adds a component, the state updates and triggers a re-render. React will reconcile the JSX: perhaps previously we had 1 Door, now state says 2 Drawers, so the Cabinet component will destroy the Door and create Drawer components. React Three Fiber will handle updating the Three.js scene accordingly (removing the old meshes, adding new ones). We should be mindful of keys if iterating over arrays of components to help React identify which is which for minimal re-render.
  
- **Modularity Benefits:** This separation means, for instance, we can work on the Door’s material and geometry independently (maybe giving it a slight bevel or nicer texture) and it will automatically apply to any door in any cabinet configuration. It also means our cut-list generation can be tied to these component types (we know each Door component corresponds to a physical door piece).
  
- **Testing Components:** We can unit-test geometry calculations for components by providing known props and ensuring the mesh dimensions match. Also visually, we can test each component in isolation (e.g., render a Door alone in a storybook or test scene) to verify it looks right.

Overall, this component-based approach treats each part of the cabinet as a **lego block**. The Cabinet (as a composition) puts the blocks together based on the blueprint (state). This follows a clean separation where adding a new type of block or changing one doesn’t disrupt the whole system. 

## Procedural Geometry Generation Techniques 
Procedural generation refers to creating the geometry of the cabinet parts algorithmically from the input parameters. In this application, the geometry is relatively straightforward (mostly rectangles), but we must carefully calculate dimensions and positions to reflect the user’s input and ensure consistency (doors fitting within the frame, etc.). Here’s how we will generate and update the geometry:

- **Parametric Dimensions:** Every part’s dimensions are derived from the cabinet’s overall width, height, depth, and the configuration of subdivisions. Rather than using any fixed models, we will generate meshes on the fly using Three.js geometry classes. For example:
  - Side panel: dimensions = `thickness × height × depth`. This can be created with `new THREE.BoxGeometry(thickness, height, depth)`. We will apply a material to it and position it appropriately.
  - Bottom panel: dimensions = `width × thickness × depth` (assuming lying flat).
  - Door panel: dimensions = `doorWidth × doorHeight × doorThickness`.
  - Drawer front: `drawerWidth × drawerHeight × drawerThickness`.
  - Shelf: `shelfWidth × shelfThickness × shelfDepth` (shelf width might be the internal width between side panels, which is `width - 2*sideThickness`, and shelf depth might be slightly less than full depth if set back a bit).
  
- **Use of BoxGeometry vs. Plane:** We could use thin BoxGeometry for solid panels. Alternatively, we might use a plane for the back panel since it’s often very thin (but plane has only one side unless double-sided material). Using BoxGeometry for everything (with appropriate small thickness for back) is fine and keeps consistent orientation and easier UV mapping (each face can have material). We will likely stick to BoxGeometry for all panels.
  
- **Geometry Updating:** When a parameter changes (say the user adjusts width from 800 to 1000 mm), we have two ways to update the geometry:
  1. **Replace Geometry**: We can dispose of the old geometry and create a new BoxGeometry with the new dimensions. R3F allows using react state/props to pass dimensions; e.g., `<boxGeometry args={[newWidth, thickness, depth]} />` inside a mesh. If `newWidth` changes, R3F will reconstruct the geometry. We just need to ensure to give the geometry a new key so React knows to replace it.
  2. **Scale**: Another approach is to initially create geometries at unit size and then scale the mesh. However, non-uniform scaling can be problematic if we care about things like consistent texture scaling and also it might scale the thickness which we might not want to change if thickness is constant. Since thickness typically remains a constant (e.g., 18mm), better to explicitly regenerate geometry for width/height changes rather than scaling (scaling could accidentally make the thickness not 18mm if scale factors differ).
  
  Therefore, we’ll opt for generating exact geometry sizes for each part.
  
- **Positioning Algorithm:** We will write logic to position each part correctly:
  - If one door: position at front, covering opening. If two doors: position each at front, left door at x=0, right door at x=(width/2 + smallGap).
  - If drawers: stack them. The bottom of the lowest drawer maybe aligns with top of toe-kick or bottom of cabinet interior. We will incorporate a small gap between drawer fronts (like 2-3mm).
  - Shelves: typically placed at mid-height of a compartment or adjustable. We can simply put one shelf halfway in each tall door compartment for now.
  - Vertical divider (if two columns): placed at x = (width/2 - thickness/2) perhaps (assuming divider thickness same as sides).
  
  All these calculations will be implemented in either the Cabinet component or a helper function. We have to be careful with clearance: e.g., if two doors, ensure there is a slight gap between them; same for a door and a drawer above/below it.
  
- **Procedural Adjustments:** Adding or removing drawers is essentially procedural modeling: if a user adds a drawer to a space that was a door, we split that space’s geometry. Our code will handle it by updating the state, which then causes the re-render with new components. For resizing (like adjusting a specific drawer’s height), we might implement a drag in the UI that changes that section’s height in state, then everything recalculates (the one above/below might also adjust).
  
- **Use of CSG (Constructive Solid Geometry):** At this stage, we likely do not need CSG because we are not cutting arbitrary shapes – all pieces are rectangular. However, if we wanted to, say, automatically notch out a toe-kick from the side panels (i.e., cut a rectangle out of the bottom-front of side panels), we could either model that by combining geometries or by using a CSG library to subtract a small box from the side panel geometry. CSG would also be useful if we wanted to have more complex joinery details. This might be overkill for our needs. We can explicitly model a toe-kick notch by creating the side as two boxes (one tall narrow, one short leg) or just ignore the notch detail visually. Given focus on overall design, we might not do such fine detail.
  
- **UV Mapping:** If we apply textures, the default BoxGeometry UV mapping might cause stretching if the board dimensions change significantly. We will address this by either:
  - Using materials with `repeat` set according to actual physical size. For example, if we have a wood texture that is 200mm x 200mm in real scale, and a panel is 600mm tall, we might set the texture’s repeat.y = 3 so the grain isn’t stretched but tiled (or just use one continuous grain but then resolution might suffer).
  - Another trick is planar mapping via shader or triplanar mapping for consistent scale, but that’s likely unnecessary here if we choose good textures and scaling.
  - We can also generate UVs manually if needed (for example, to align wood grain directions on different panels).
  
- **Realistic Details:** If time permits, small procedural details could enhance realism:
  - Rounding edges of the cabinet slightly (a bevel on edges) so it catches highlights. We could do this by using a `RoundedBoxGeometry` from Drei for doors or edges, or manually chamfer via a custom geometry. This might be complex and not essential, but it’s a possible enhancement.
  - Gap simulation: As mentioned, leaving gaps between moving parts (doors/drawers) by slightly reducing their size relative to opening. We will incorporate a gap ~2-3 mm around each front.
  
- **Performance of Geometry Generation:** The geometry counts are low (each panel is just 12 triangles if a box). Even if we recreate them on each change, it’s negligible for the browser. We should dispose of old geometries to free memory; R3F might handle some of that if keys change. If using raw Three.js, we’d call `geometry.dispose()`. With R3F, if we remove a mesh, it will dispose if no longer used (unless we reuse geometry).
  
- **Validation:** We will also ensure input values are constrained to sensible ranges (e.g., prevent negative or zero dimensions). The UI will likely handle that by min values. Our geometry logic should also guard against weird cases (like width so small that two doors wouldn’t fit – but UI can prevent that scenario by not offering double door for width under some threshold).
  
In short, **procedural generation** in this project is about computing all the necessary part dimensions from a few input numbers. This is a classic parametric design task. By using robust calculations and Three.js primitives, we can cover all needed shapes. The outcome is a flexible system: change any input, and all parts reposition and resize accordingly, maintaining a valid cabinet structure.

## Save and Export Functionality (Images, 3D Models, JSON) 
Providing export options increases the utility of the application by letting users save their designs for later or use them in other tools. We will implement the following export features:

- **Image Screenshot Export:** We will allow the user to capture the current 3D view as an image. Technically, since the 3D scene is rendered to a canvas, we can use the renderer’s DOM element to get a data URL:
  - Using React Three Fiber, we can obtain the WebGL renderer via the `useThree()` hook. For example: `const gl = useThree((state) => state.gl)`.
  - Then, on a button click (say “Save Image”), we call `gl.domElement.toDataURL("image/png")`. This returns a Base64 PNG data string. We can initiate a download by creating a temporary `<a>` with `href` set to that data URL and `download="cabinet.png"` and clicking it programmatically.
  - We might want to render at a higher resolution for the screenshot than the canvas is currently at (to get a HD image). One approach is to temporarily increase the pixel ratio or size, render one frame, read the pixels, then revert. This is more advanced, but possible if needed (ensuring we don’t blow memory).
  - We’ll also ensure the canvas has `preserveDrawingBuffer: true` if needed to allow reading after rendering (though toDataURL might work without that in modern browsers, we’ll verify).
  
- **3D Model Export (GLTF/OBJ):** We will integrate Three.js exporters:
  - **GLTFExporter**: This will be our primary export for 3D models. glTF is modern, compact, and well-suited for web and other tools ([Preferred 3d model format of THREE.JS [closed] - Stack Overflow](https://stackoverflow.com/questions/11243689/preferred-3d-model-format-of-three-js#:~:text=Preferred%203d%20model%20format%20of,SEA3D%20are%20also%20well%20supported)). We will likely prefer the binary .glb for easier download (single file). The process:
    - Import GLTFExporter from Three.js examples (`three/addons/exporters/GLTFExporter.js`).
    - When user clicks “Export 3D Model”, we call `exporter.parse(cabinetObject, onComplete, onError, {binary:true})`. Here, `cabinetObject` could be the Three.js Group for the cabinet. R3F gives us a reference to it via a ref or by using the useFrame/useThree to get scene and find the object.
    - In onComplete, we get an ArrayBuffer (for binary GLB). We then create a Blob from it (`new Blob([arrayBuffer], { type: 'model/gltf-binary' })`) and create an object URL to download (`URL.createObjectURL(blob)`), then trigger download similarly.
    - GLTFExporter will include mesh geometry, materials, and even lights/camera if we export the whole scene. We might export just the cabinet mesh (better, so the file is just the object). According to the docs, we can export an `Object3D` (which can be a Group) ([threejs.org](https://threejs.org/docs/examples/en/exporters/GLTFExporter.html#:~:text=,...%20%29)). That way we won’t include the environment or controls in the export.
    - We should ensure materials export properly. MeshStandardMaterial is glTF-compatible. Textures would be embedded if we use them (GLTFExporter can embed textures in the .glb).
  - **OBJExporter**: As an alternative for users needing OBJ format, we can do something similar with OBJ. Three.js has an OBJExporter in examples. Usage is similar: `const exporter = new OBJExporter(); const result = exporter.parse(cabinetObject);` which returns a string of the OBJ format, then download it as .obj text file. However, OBJ won’t include materials in one file (MTL separate), so glTF is preferred. We can include it if easy, but it’s optional.
  - We will guide users towards glTF (maybe label it “Export 3D Model (.glb)”).
  
- **JSON Specification Export:** The app will produce a JSON representation of the design. This will basically serialize the **state** (or a cleaned version of it) into JSON:
  - We will include at least the core parameters: width, height, depth, type.
  - The structure of doors/drawers (like an array of sections with their type and size).
  - We could also include derived info like part list here, but that might be overkill since we have cut-list separately. Likely the JSON is meant for re-import or usage in a programmatic context.
  - Example JSON:
    ```json
    {
      "width": 900,
      "height": 720,
      "depth": 600,
      "type": "base",
      "structure": {
        "columns": 1,
        "sections": [
          { "type": "drawer", "height": 150 },
          { "type": "drawer", "height": 150 },
          { "type": "door", "height": 400 }
        ]
      },
      "material": "default" 
    }
    ```
    (We can include a material or finish identifier if needed, e.g., "white paint" or "oak wood" etc., if that becomes a user choice.)
  - The JSON export can be done by `JSON.stringify(state, null, 2)` to make it human-readable and then triggering a download with a `.json` file extension.
  - We should ensure no reactive functions or class instances are in that object – basically take only the plain data. With Zustand, our state object might contain functions; we’ll create a new object that strips those out.
  
- **Re-import (not explicitly asked but implied by JSON):** If we have JSON export, we might later allow users to import that JSON to restore a design. This isn’t explicitly requested, but it’s a logical complement. We can plan a simple import by reading a JSON file and merging it into state (ensuring it matches expected schema).
  
- **Cut-List Export:** This overlaps with the next section, but in terms of implementation, the cut-list is essentially another form of export. We might provide it as:
  - A formatted HTML table the user can read/copypaste.
  - A downloadable CSV file (which can be opened in Excel).
  - Or include it in the JSON spec as a field.
  We'll discuss generation in next section, but for export mechanism, CSV is likely easiest for manufacturing folks. To export CSV, we generate a string like:
  ```
  Part, Width (mm), Height (mm), Thickness (mm), Quantity
  Side Panel, 720, 580, 18, 2
  Bottom Panel, 564, 580, 18, 1
  ...
  ```
  Then create a blob `text/csv`. Alternatively, just provide a button to copy the table.
  
- **User Interface for Exports:** We will have an “Export” section in the UI (maybe modal or just buttons):
  - “Save Image” -> triggers screenshot.
  - “Export 3D Model (GLB)” -> triggers GLB export.
  - “Export JSON” -> triggers JSON download.
  - “Show Cut List” -> perhaps opens a modal or section with the list, with an option to download CSV.
  
- **Third-Party Integration Consideration:** Because this is all client-side, there’s no server. We rely on the user to download and save. We might integrate with localStorage to autosave the last design (so if they refresh, it’s not lost unless they saved manually).
  
- **Testing Exports:** We will test the GLB by importing it into Blender or an online glTF viewer to ensure geometry and materials come through correctly. We’ll test JSON by re-importing in the app (if we implement import). The image download, we’ll test in various browsers for proper file naming and transparency (likely the canvas background will be clear unless we set a backdrop color; we might set a neutral backdrop in the renderer for nicer screenshots).

By implementing these export features, we provide the end-user tangible outputs of their design: a picture for reference or sharing, a 3D file for further 3D work or AR viewing, and specification data for building the cabinet. These features elevate the tool from just a visualizer to a practical design tool.

## Cut-List Generation (Materials and Dimensions for Manufacturing) 
One deliverable of the application is a **cut-list**: a detailed breakdown of all the pieces (panels) needed to construct the designed cabinet, including their dimensions. This is extremely useful for woodworkers or automated cutting. We will generate the cut-list as follows:

- **Identifying Parts:** We know a standard cabinet consists of:
  - 2 side panels (left, right)
  - 1 bottom panel
  - 1 top panel (except maybe base cabinets if not counting countertop; but we’ll assume a top panel for completeness or have it optional)
  - 1 back panel
  - Shelves (could be 1 or more, or none, depending on design)
  - Doors and/or drawer fronts (variable count)
  - For each drawer front, if actual drawer boxes are implied, each drawer would also have 2 drawer sides, 1 drawer back, 1 drawer bottom. However, whether we include drawer internals in cutlist depends on scope. The user story doesn’t explicitly mention listing drawer box parts, just says “materials list with dimensions for manufacturing.” If we want a truly complete cut list, we *should* include drawer box components as well. But that requires assumptions about drawer construction (like typically drawer sides same material thickness, etc.). We might provide a basic listing for drawer fronts (which are visible) and perhaps note that drawer box parts are not listed. For thoroughness though, let's consider at least listing drawer fronts (since those are part of the cabinet’s external spec). Possibly we will list a generic entry like “Drawer box (set) – quantity N” if needed.
  - If a base cabinet with a toe kick platform, maybe a toe kick board piece.
  
- **Dimensions Calculation:** Using the state and known thickness values, we compute each part’s dimensions:
  - **Side Panels:** Height = cabinet height, Depth = cabinet depth (assuming full depth side panels), Thickness = side panel thickness (e.g. 18mm). Quantity 2.
  - **Bottom Panel:** Width = cabinet internal width (which could be equal to overall width if side panels sit *under* bottom, or if side panels sit *beside* bottom). Typically, for cabinets, sides often sit on top of bottom for base cabinets (so total width includes side thickness) or sides flush with bottom edges and bottom is inset. We need to decide assembly:
    - Option 1: Bottom panel goes between side panels. Then bottom width = width - 2*sideThickness, and bottom depth = depth (flush with front/back).
    - Option 2: Bottom panel extends full width, and side panels sit on top of it at the edges. Then bottom width = full width, bottom depth = depth, but it might have notches for toe kicks or etc. Let’s assume Option 1 (common in frameless cabinets: bottom is between sides) – so we’ll reduce widths accordingly for internal parts.
  - **Top Panel / Stretchers:** If we include a full top panel, similar to bottom. In some cabinets, instead of a full top panel, they have stretchers (front and back strips). We’ll keep it simple with a full top panel for a closed box (or for wall cabinets definitely a full top).
  - **Back Panel:** Width = cabinet internal width (which is width - 2*sideThickness if back sits between sides), Height = cabinet internal height (height - maybe top/bottom thickness if those cap it). However, often the back panel is nailed on covering the full back, in which case width = full cabinet width, height = full height, but thickness is thin (e.g., 5mm). It can go in a rabbet or over the back. We can assume it covers full back externally. So back width = cabinet width, back height = cabinet height, thickness = backThickness (like 3mm or 1/8").
  - **Shelves:** If one shelf, it typically is as wide as internal width (between sides) and as deep as internal depth (between back and front or flush to front?). Usually shelves sit behind the door, not flush with front, so shelf depth might be slightly less than full depth to allow door hinge clearance. But we can consider full depth minus door thickness. Simpler: shelf depth = cabinet depth - (backThickness) (if back is on back) and maybe - a small gap at front. But we can just give full depth in cut list, since a slight gap is not critical.
    - Shelf width = internal width (width - 2*sideThickness).
    - Shelf thickness = same as side thickness (if using same board material).
    - Quantity: if we decide one shelf per door section by default. If two doors side by side, each compartment gets a shelf: so 2 shelves (one for each half).
    - We might allow no shelf in a small cabinet maybe. For cutlist, we’ll list whatever is present.
  - **Vertical Divider:** If two columns (double door), a vertical divider panel: Height = internal height (if it runs full height inside), Depth = cabinet depth (minus back if it fits between back and front frame or flush?), Thickness = side thickness. Quantity 1 (center).
  - **Doors:** If single door: width = cabinet front width minus small clearance, height = cabinet front height minus clearance. If double doors: each door width = half of front width minus clearance. Height = full front height minus clearance. Quantity 2 in that case. We will list each door as one line or combined if identical? We could combine identical parts (like “Door panel 2× – 356×716×18mm”), which is usually how cut lists are presented (with quantity).
  - **Drawer Fronts:** For each drawer front: width = cabinet internal width (or full width if drawers span the full cabinet width), height = as designed (they may all equal or some custom distribution). We list each unique size or if all drawers are equal, combine them with quantity. If drawers differ in height, list each drawer front individually or group if any are same.
  - **Drawer Box parts:** If we go that far: each drawer typically: 2 sides (height = drawer opening height - clearance, depth = cabinet depth minus front thickness and minus some clearance, thickness usually 12mm or 15mm if using different material), 1 drawer back (width ~ internal drawer width, height same as sides, thickness same), 1 drawer bottom (width ~ internal drawer width, depth ~ internal drawer depth, thickness usually 6mm ply). 
    - To avoid making assumptions, we might exclude these from the first iteration of cut list. Or list drawer bottom as same as shelf thickness etc. It could get too granular.
    - Perhaps we provide a note like “(Drawer box components not listed)” unless we confirm specifics.
  - **Toe Kick**: If included as separate (some cabinets have a continuous toe kick for multiple cabinets, but if single, might have 1 or 2 boards). We may ignore or list a base platform board.

- **Material and Board Thickness Assumptions:** We assume a uniform board thickness for all structural pieces (like 18mm plywood) except back panel (thin) and perhaps drawer bottoms (thin). We will state those assumptions. Cut list should ideally group by material: e.g., all 18mm plywood parts vs all 6mm back panels, etc. We can include a column for material (like “3/4″ plywood” vs “1/4″ hardboard”).
  
- **Format:** We will present the cut list in a tabular form:
  Columns: Part Name, Quantity, Length, Width, Thickness (and maybe Material).
  For example:
  ```
  Side Panel         | 2 pcs | 720 mm x 580 mm x 18 mm (plywood)
  Bottom Panel       | 1 pc  | 564 mm x 580 mm x 18 mm (plywood)
  Shelf              | 1 pc  | 564 mm x 560 mm x 18 mm (plywood)
  Door Panel         | 1 pc  | 280 mm x 700 mm x 18 mm (plywood)
  Drawer Front       | 2 pcs | 564 mm x 150 mm x 18 mm (plywood)
  Back Panel         | 1 pc  | 720 mm x 580 mm x 5 mm (MDF)
  ```
  (This is just an illustrative example; actual numbers depend on config.)
  
  We will generate this list in the `cutlist.js` utility. It will likely take the state and produce an array of entries. For each entry, we might give it an id or name, then aggregate if multiple of same size.
  
- **Algorithm to Generate Cut List:**
  1. Determine board thickness values: `T` for structural (sides, bottom, etc.), `Tb` for back, `Td` for drawer bottoms if included.
  2. Calculate internal width = width - 2*T (if bottom fits between sides, else internal width = width).
  3. Calculate internal height = height - (maybe top thickness + bottom thickness if they sit between sides? Or height includes them). We might treat height as external height including the thickness of bottom and top. If so, internal height = height - T (bottom) - T (top) for back panel if back sits inside. But if top and bottom are flush with top and bottom of sides, then internal height = height. Assembly assumptions matter; let's assume flush top and bottom (sides go full height, bottom sits flush at bottom, top flush at top inside), so internal height = height (except minus maybe a stretchers vs full top panel difference).
  4. Create list:
     - Side: qty 2, size: Depth × Height × T (we give L×W as Height×Depth perhaps for cut dimensions, thickness separate).
     - Bottom: qty 1, size: internal Width × Depth × T.
     - Top: qty 1, size: internal Width × Depth × T (if type=base and we consider countertop instead, we might still include top for a standalone piece).
     - Back: qty 1, size: Width × Height × Tb.
     - Shelves: qty equal to number of shelves, size: internal Width × (Depth - backThickness - doorClearance) × T. (We might subtract a bit from depth if shelf is not full depth).
     - Vertical divider: if applicable, qty 1, size: (Depth - backThickness) × (Height) × T.
     - Doors: for each door panel: qty 1 (or 2 if identical and we combine line), size: doorWidth × doorHeight × T.
     - Drawer fronts: each or grouped by identical sizes, size: drawerWidth × drawerHeight × T.
     - (If including drawer box pieces: list drawer side, back, bottom similarly).
  5. For naming, use descriptive names like "Side Panel", "Door Panel", etc., possibly with numbering if multiple different doors. However, grouping identical parts (like 2 side panels) in one line is clearer.
  6. We will ensure to round dimensions to nearest whole number or one decimal if needed (since these likely come out exact from our state which is likely integer mm).
  
- **Displaying Cut List:** The control panel might have a button "Generate Cut List" which toggles a view (could be a modal or an expandable panel) showing the table. This table can be copy-selected or there is a download CSV button.
  
- **Verification:** We will test the cut list against a few configurations manually to ensure it all adds up to the original design. (E.g., check that door widths plus gaps equal total width, etc.)

By providing the cut-list, our app moves beyond visualization into the realm of **practical execution**. Users can go from designing a cabinet to actually cutting the pieces for it. This feature will likely be appreciated by DIY enthusiasts and professionals alike.

## User Interface and Controls 
To allow users to conveniently input parameters and interact with the design, a well-thought-out UI is needed. We will create a **control panel UI** for all inputs and actions, focusing on clarity and ease of use:

- **Layout:** The UI will be presented alongside the 3D canvas. Since desktop is the target, we can use a sidebar on the right (or left) that contains sections for Dimensions, Configuration, and Export. The 3D view will occupy the rest of the screen. The sidebar can be a collapsible panel if the user wants to temporarily hide it for a full-screen 3D view.
- **Dimensions Input:** At the top of the panel, we’ll have fields for **Width, Height, Depth** (and possibly a dropdown for units if we support both mm/inches). These can be number inputs or sliders. Number inputs with step controls (with min and max sensible limits) are good for precision. We might use a component from Radix (like Radix Slider for a range) in conjunction with an input box. Or Leva: Leva can provide a number input with drag adjustment easily ([Leva - React Three Fiber Tutorials](https://sbcode.net/react-three-fiber/leva/#:~:text=const%20color%20%3D%20useControls%28,green%27%2C)). We will label these clearly and perhaps show the unit (e.g., “Width (mm)”).
- **Cabinet Type Toggle:** A simple toggle or dropdown for **Base vs Wall** cabinet. This might change the defaults (for instance, a wall cabinet might default to a lesser depth and no toe kick). We’ll implement it as a radio toggle.
- **Doors/Drawers Configuration UI:** This is the more dynamic part. We need to let the user add or remove doors and drawers:
  - One approach: Provide buttons **“Add Drawer”**, **“Add Door”** which either split an existing section or add another section. But this requires a notion of selecting which section to split.
  - Simpler approach: Pre-define some common layouts and let user pick one, then adjust. For example, radio options like: “Single Door”, “Double Door”, “Two Drawers”, “Three Drawers”, “Door + Drawer” etc. However, the requirement sounds like free-form.
  - We could use a small visual schematic: e.g., a rectangle representing the cabinet front, with draggable dividers. This is ideal but would take more time to implement. Alternatively, a list of sections:
    - Represent the front sections as a list in order from top to bottom. Each item in the list could show the section type (door or drawer) and its height (maybe as a percentage or value). We can allow the user to click an item to change type or use drag handles to resize.
    - For resizing drawer heights: we can implement a vertical splitter in the UI or just up/down arrows to increment one drawer’s height and decrement the neighbor’s.
    - Initially, possibly restrict to either all drawers or one door or two equal doors, to not get too complicated. But since dynamic is asked, we’ll outline a UI for that:
      - We have an “Add Section” button that adds a new section at bottom or top. If you add a section and there was a door, maybe it converts the door into two sections (like replacing it with two drawers?).
      - Or a simpler trick: allow adding only drawers (since adding a door in a scenario where one exists doesn’t logically stack, it would become two doors side by side, which is a different kind of addition – horizontal split).
      - Actually, “Add Door” might mean if currently one door, adding another door might imply converting to a double-door (two columns). That’s a different dimension (horizontal instead of vertical).
      - Perhaps handle vertical additions (drawers) separately from horizontal (columns). We could have a toggle for 1 or 2 columns. If 2 columns is chosen, we automatically create two doors by default, and possibly allow drawers within each column but that’s extremely complex UI (two independent stacks).
      - For MVP, maybe restrict horizontal to at most 2 columns (single or double). If double, we treat it as two equal compartments side by side. Each compartment could then have its own vertical sections possibly (like left side could be door, right side could be drawers). That’s a valid scenario in cabinetry (half-and-half). But implementing UI for that might be advanced – we can mention as a future extension. For now, we might assume columns either 1 or 2, and if 2, we for simplicity make both columns the same type (two doors). Or we allow one column drawers one column door but that complicates interface significantly.
      - Given time, let’s aim for: user can choose 1-column or 2-column layout. If 2-column, we assume just two doors for now (since drawers in each half would be a niche case).
      - And user can choose number of vertical sections (if 1 column): e.g., 1 (just a door), 2 (could be two drawers or a drawer + door), 3, etc. We can provide a dropdown for “Number of sections” or an “Add drawer (vertical)” that stacks.
    - Concretely, in UI:
      - A dropdown: “Front Layout: [ Single Column | Double Column ]”.
      - If single column selected:
        * A list or dropdown for “Sections: 1 Door / 2 Drawers / 3 Drawers / 1 Drawer + 1 Door” etc. We can list common combos explicitly.
        * Alternatively, if we allow arbitrary, we start with 1 (door). The user can click “Add Drawer” which will add a drawer either above or below. Perhaps always add at bottom for example. If a door existed, adding a drawer could either turn the bottom part into a drawer leaving a smaller door above, etc.
      - If double column selected:
        * We likely just assume two doors (the most typical case). We can later allow adding drawers inside each, but that requires subdividing columns as separate single columns. Perhaps beyond initial scope.
      
  - For the technical plan, we describe a UI allowing flexibility: for example, a list of sections where each can be “Door” or “Drawer”, and the user can add or remove sections. To implement this, we might use something like an array of section objects in state and simple controls:
      * Each section entry in UI: “Type: [Door/Drawer] – Height: [value or percentage]”. If we enforce equal distribution for simplicity when adding, at least initially, we might just say if you have N drawers, they’re equal height (which is common in e.g. a 4-drawer stack). If the user wants to resize one, maybe not in first iteration.
      * Remove section button to remove a drawer (if at least 2 sections exist).
      * If user chooses one of them to be a door while others are drawers, maybe we allow that but then conceptually the door would occupy all remaining space not taken by drawers. Possibly allow at most one door in mix with drawers and it must be bottom or top? Some cabinets have a drawer above a door (common in kitchen base: one drawer at top, then a door below covering rest). That’s a specific case of 2 sections: drawer + door.
      * We can simplify: allow at most one door in a single column layout, and if present, it must be the bottom section with drawers above it (like a top-drawer, bottom-door scenario). Or door above, drawers below (some bathroom vanities have a small door above and drawers below, though less common).
      * But typical is drawers on top of door or all drawers or all doors.
      * For clarity, maybe we restrict to either all drawers, or one door with optional drawers above it (like 0,1,2 drawers above).
  
  Given the complexity, we will plan the data model flexible, and implement UI with a mix of preset choices and limited editing for now, while allowing future extension for full arbitrary control.

- **Control Implementation:** 
  - If using Leva, we could simply do `useControls` like:
    ```js
    const { width, height, depth, sections } = useControls({
      width: { value: 900, min: 300, max: 2000, step: 10 },
      height: { value: 720, min: 300, max: 2500, step: 10 },
      depth: { value: 600, min: 200, max: 1000, step: 10 },
      sections: { value: 1, min: 1, max: 5, step: 1 }
    });
    ```
    This would create number inputs with sliders. However, Leva might not easily handle a dynamic array of sections in a straightforward way. Leva excels for static parameters. So we could use it for basic dims, but for adding/removing sections it might not be as straightforward. We may need custom UI for that part (like our own list with buttons).
  - Radix UI could be used to build a list with plus/minus buttons for sections.
  - Possibly simpler: have separate controls: 
    * A numeric input or slider for “# of Drawers” (vertical sections). If set to 0, means 1 door (no drawers). If >0, means that many drawers and no door? But what if they want a door and drawers?
    * Or a checkbox “Include door” and a number “# drawers above door”. That could explicitly cover the common case: if checked, we have a door at bottom and maybe N drawers above it. If unchecked, then either all drawers or maybe two doors side by side if double column selected.
    * Actually, we can combine that: 
      - For single column: have a select: 
        - “All doors” (which for one column means just one door),
        - “Door with drawers above”,
        - “All drawers”.
        If “Door with drawers above” selected, show a field for how many drawers above (1 or 2 typical).
        If “All drawers” selected, show # of drawers (1 to maybe 5).
      - For double column: likely just two doors (maybe allow 2 columns of drawers but that’s like two narrow drawer stacks which isn’t typical individually; usually a double column means each column is narrower than a full cabinet so drawers in each might be too narrow to be useful in real scenario).
        Possibly allow double column and all drawers scenario if someone wants two narrow drawer banks. But likely not needed.
  
  - We will implement validation: e.g., if they try to add so many sections that each becomes too small (we can set a min section height of say 100mm), prevent it.
  - The UI will update state on changes, which triggers 3D update.

- **Export and Cutlist UI:** As mentioned, we’ll have buttons for those. Possibly in a separate collapsible section or at bottom: e.g., [Save Image], [Download GLB], [Download JSON], [View Cut List]. The cut list could appear in a pop-up or modal because it can be a big table. We might use a modal component (Radix has a Dialog primitive) for the cut list output.

- **Aesthetics:** Using Radix or a CSS framework, we’ll ensure the UI is clean (not cluttered, proper spacing). Icons or small illustrations might help (like an icon for add drawer). However, text and simple buttons are fine for a technical tool.
- **Accessibility:** We plan to use Radix UI which emphasizes accessibility (keyboard navigation, screen reader labels). We will label all inputs clearly. Also ensure contrast is good for text.
- **Responsiveness:** On smaller screens (if someone tries on a tablet or small laptop), the sidebar could become a collapsible menu. The Canvas can resize accordingly. We should test that UI components don’t overflow.

- **Using the App Workflow:** 
  1. User opens app, sees a default cabinet (maybe a base cabinet of 2 doors, or a common default).
  2. User enters desired width/height/depth in the panel.
  3. User selects if they want drawers: e.g., chooses “3 Drawers” – the 3D updates to show 3 drawer fronts.
  4. User changes their mind to “1 Drawer + Door” – UI updates, 3D now shows a drawer at top and a door below.
  5. They orbit around to view inside if they want (maybe open door not implemented, so they can't actually see inside unless we hide door – not in scope, but we could allow making the door transparent for a moment when configuring shelves? Possibly not needed).
  6. User clicks “View Cut List” – a modal pops up listing parts.
  7. User clicks “Save Image” – triggers download of screenshot.
  8. User clicks “Download 3D” – gets a GLB file to their machine.
  
- **Optional Nice-to-haves:** 
  - A toggle to show/hide certain parts (for example, toggle “X-ray view” to see inside).
  - Another could be preset styles (materials): e.g., a dropdown for finish: “Oak Wood”, “White Paint”, etc., which just changes textures/material colors.
  - These are not required but can be easily added if time permits, since materials can be swapped and such state can be managed similarly.
  
- **Leva vs Custom UI Decision:** We might start development with Leva because it accelerates hooking up controls (especially for numeric inputs) ([Leva - React Three Fiber Tutorials](https://sbcode.net/react-three-fiber/leva/#:~:text=const%20color%20%3D%20useControls%28,green%27%2C)). As we polish, we can replace the Leva panel with a custom UI built with either Radix or plain React components + CSS. Leva’s default look is a floating panel with minimal styling (good for prototyping, but not as branded). For a public-facing tool, a custom styled panel (perhaps using a design system) is preferable. Radix primitives would allow building such without compromising accessibility ([Radix Primitives](https://www.radix-ui.com/primitives#:~:text=Core%20building%20blocks%20for%20your,design%20system)). We will mention the possibility of using Radix to stakeholders if a more unique UI design is desired. 

In summary, the UI will serve as the **command center** for the user to input and adjust the design parameters and to trigger outputs. By keeping it simple and intuitive (with clear labels like "Width", "Add Drawer", etc.), we ensure the user can focus on designing rather than figuring out controls. Using modern UI libraries ensures the interface is polished and consistent.

## Development Roadmap 
We will execute the project in stages, ensuring that at each milestone we have a working subset of functionality that can be tested and iterated upon. Below is a proposed **step-by-step roadmap**:

1. **Project Setup (Week 0-1):** 
   - Initialize the project with React (using Vite or Create React App for a quick start). Install dependencies: React Three Fiber, Drei, Zustand, etc.
   - Set up the basic application structure and repository. Create the `<Canvas>` with a simple scene (maybe just a placeholder box) to verify Three.js is rendering.
   - Establish the global state store (Zustand store with basic fields for dimensions, and a sample action).
   - **Milestone 1:** “Hello World” of 3D – a single cube renders on the canvas and can be controlled (e.g., a slider that changes its size using state).

2. **Basic Cabinet Model (Week 1-2):** 
   - Implement the `CabinetBody` component with fixed panels (no dynamic doors/drawers yet). Input the state dimensions to it. For now, assume one compartment.
   - Render a simple cabinet box: two sides, a bottom, maybe a top and back. Use basic materials.
   - Set up camera and light to view it nicely.
   - **Milestone 2:** A rectangular cabinet carcass appears, and when the user changes width/height/depth inputs, the carcass updates its size accordingly. This confirms parametric scaling works.

3. **User Input UI for Dimensions (Week 2):** 
   - Implement a simple control panel section for entering width/height/depth and type. Could use Leva at first for quick progress.
   - Bind these controls to the state (so that changing them updates the 3D).
   - Add validations (e.g., min/max values).
   - **Milestone 3:** The user can interactively set dimensions via the UI, making the 3D model adjust in real-time.

4. **Doors and Drawers Mechanics (Week 3):** 
   - Extend the state to include the front structure (sections). Start with simpler approach: maybe allow toggling between a single door vs a certain number of drawers as a proof of concept.
   - Implement the Door and Drawer components. For now, perhaps create a door or multiple drawers of equal size depending on state.
   - Update the Cabinet component to render Door/Drawer components according to state.
   - UI: add controls to select configuration (e.g., radio: 1 door vs N drawers).
   - **Milestone 4:** The front of the cabinet can switch between at least two configurations (e.g., a single-door cabinet and a 3-drawer cabinet) using a UI control, and the 3D view updates accordingly. Internal shelves/dividers might still be static at this point or not present.

5. **Advanced Front Configuration (Week 4):** 
   - Implement logic for mixed configurations (e.g., drawer + door combination). Expand UI to allow adding/removing sections dynamically if possible. (This may involve a more complex component for the list of sections.)
   - Ensure that the positioning math for arbitrary section splits works and the parts don’t overlap or leave gaps.
   - Test various edge cases (very short cabinet with many drawers, tall cabinet with one small drawer, etc.).
   - **Milestone 5:** Achieve the full flexibility for a single-column cabinet: the user can create a stack of arbitrary combination of one door and multiple drawers. The app robustly handles these changes.

6. **Internal Structure Automation (Week 5):** 
   - Implement rules for internal components: e.g., if there are two doors side by side (when we implement double column), add a vertical divider piece. If a door section exists, add a shelf inside that section.
   - So, if state says double door, CabinetBody adds a middle vertical panel. If state says a door present (with whatever above it), add a shelf panel in that door’s space.
   - Possibly split this over a couple of iterations: first do vertical divider for double columns, then do shelf for door sections.
   - **Milestone 6:** The cabinet’s internal structure responds to configuration: e.g., toggling from all-drawers to a door will cause a shelf to appear; choosing double doors adds a divider, etc. The geometry still looks correct and nothing protrudes incorrectly.

7. **Enhance Visual Realism (Week 6):** 
   - Upgrade materials: apply a basic wood texture or a nice color. Tweak lighting: add environment map, add shadows. (Until now, we might have a basic light; now refine it as per the Rendering Setup plan).
   - Introduce a ground plane and enable shadows properly. Tune the camera and controls limits.
   - Optionally, incorporate a nicer environment (maybe use an HDR from assets and Drei’s <Environment>).
   - **Milestone 7:** The cabinet now looks much more realistic – the difference should be noticeable with proper lighting and materials. Take screenshots to compare before/after.

8. **Handles and Details (Week 6):** 
   - Add Handle components to doors and drawers. Decide default placement (centered horizontally, a set distance from top/bottom).
   - If possible, differentiate between door handles (vertical orientation) and drawer handles (horizontal orientation) if using bar handles. Or just use knobs for simplicity on all.
   - Ensure the handle appears on the correct side for double doors (left door vs right door).
   - **Milestone 8:** Doors and drawers have handles, completing the visual appearance of a cabinet. The model is now feature-complete in terms of parts.

9. **Export Features Implementation (Week 7):** 
   - Add the screenshot function: test in browser and ensure download works. Possibly add option for image resolution if needed.
   - Add GLTF export: integrate the GLTFExporter. Test by downloading and opening the file in a viewer.
   - Add JSON export: create a function to gather state to JSON. Ensure consistency (maybe omit functions).
   - UI: create an “Export” panel or modal with these options.
   - **Milestone 9:** The user can successfully download their model and specification. We’ll verify the GLB opens correctly and JSON matches current state.

10. **Cut-List Generation (Week 7-8):** 
    - Implement `cutlist.js` to compute parts. Start with straightforward single-column scenario, then handle double.
    - Format the output nicely (maybe as HTML for on-screen, and as CSV for download).
    - UI: a button to display the cut list. We might show it in a <pre> formatted text or a small table layout.
    - **Milestone 10:** Given a design, the app produces a correct cut list. Test against known dimensions for accuracy.

11. **Polish UI & UX (Week 8):** 
    - If we used Leva, by now consider replacing it with a custom panel (unless we decide to keep11. **Polish UI & UX (Week 8):**  
    - Refine the control panel interface. If we initially used Leva for speed, now replace or augment it with a custom UI (potentially using Radix UI components) to achieve a professional look and layout. Ensure that the panel is intuitive: group related controls (dimensions, layout, outputs) with clear headings. Add units labels (mm/inch) and perhaps tooltips for any non-obvious options.  
    - Improve responsiveness: test the layout at different window sizes. The sidebar might become a collapsible menu on smaller screens. Ensure the canvas resizes properly with the window. 
    - Add finishing touches like confirming that button styles, font sizes, and spacing are consistent. Incorporate any branding (colors or logos) if applicable.  
    - **Milestone 11:** The application UI is clean and user-friendly. All controls are properly labeled, and the overall user experience (UX) is smooth (no lag on updates, easy to understand what to do).

12. **Testing, Optimization, and Deployment (Week 9):**  
    - **Testing:** Rigorously test all features across browsers (Chrome, Firefox, Safari) to ensure compatibility. Test edge cases: extremely large or small dimensions, maximum number of drawers, unusual combinations. Verify that invalid inputs are handled gracefully (e.g., negative or zero values reset to min). Also test the export files: open exported GLB in a 3D viewer to confirm geometry and materials, load JSON back into the app (if we implement import) to ensure it restores state, open the cut-list CSV in a spreadsheet to check formatting.  
    - **Performance Optimization:** Profile the app for any performance bottlenecks. Given our scope, it should be lightweight, but we check that re-renders are not happening more than necessary. We may use the React Profiler or console logs to ensure, for example, adding a drawer doesn’t re-mount the whole scene needlessly. Utilize `useMemo` or `useCallback` in React where appropriate to prevent unnecessary recalculations (e.g., memoize geometries if dimensions unchanged). Three.js side: ensure we aren’t accumulating geometries in memory (dispose if needed). Also, fine-tune shadow settings (reducing resolution or range if performance on lower GPUs is an issue) and consider providing a toggle for turning off fancy effects (like SSGI) if someone on an older machine needs it.  
    - **Deployment:** Prepare the app for deployment as a static site. For example, build the React app and host on GitHub Pages or Vercel. Because there’s no server component needed (all is client-side), deployment is straightforward. We’ll include all assets (textures, HDR environment) in the build. Ensure the loading of these assets (if any) is handled (maybe show a loading spinner if the HDR is large).  
    - **Documentation:** Write a concise user guide (could be a README or a help section in the app) explaining how to use the designer, what each control does, and any limitations. Also document the code for future developers – especially the data structure for cabinet configuration and how to extend it.  
    - **Milestone 12:** The application is tested and optimized. It is deployed and accessible publicly. Users can now reliably design a cabinet and obtain all outputs, and the tool performs well on the target devices/browsers.

## Conclusion and Future Extensions 
By following this technical plan and execution roadmap, we will build a **fully functional procedural 3D cabinet designer web application** that meets the outlined requirements. The solution uses a robust tech stack (React, Three.js with React Three Fiber, Zustand state management) to ensure both developer productivity and runtime performance. We have detailed the component-based architecture for representing cabinet parts, the rendering configuration for realistic visuals, and the logic for dynamically adjusting the model based on user input. 

Upon completion, users will be able to effortlessly create custom cabinet designs to their specifications, visualize them in real-time with high fidelity, and export everything needed to turn the design into reality (images for presentation, 3D models for further CAD or AR usage, JSON specs for data exchange, and cut-lists for fabrication). The app will be accessible to anyone with a modern browser, reflecting a practical and innovative use of web technology in the domain of furniture design.

Looking forward, this platform could be extended with additional features such as a library of different cabinet styles (e.g., face-frame cabinets, different door designs), the ability to arrange multiple cabinets in a kitchen layout, or even AR preview. However, the foundation laid out in this plan focuses on a single cabinet designer and provides a **clear, modular framework** that can support such enhancements in the future. 

Overall, this plan ensures a **professional, well-organized implementation**. By adhering to it, the development team can build the cabinet designer in a systematic way, achieving the end goal of a powerful and user-friendly application for designing cabinets procedurally on the web. 

