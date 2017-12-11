import { CSSModules, CSSPlugin, FuseBox, StylusPlugin } from "fuse-box";
import { argv } from "yargs";

// Arrange yargs input
interface IBuildConfig {
    watchMode: boolean;
    hotModuleLoading: boolean;
    devServer: boolean;
    productionMode: boolean;
}
const config = {} as IBuildConfig;
config.watchMode = argv.watch || false;
config.hotModuleLoading = argv.hotModuleLoading || false;
config.devServer = argv.devServer || false;
config.productionMode = argv.productionMode || false;

// Configure build steps

const fuse = FuseBox.init({
    homeDir: "src",
    output: "public/dist/$name.js",
    tsConfig: "./tsconfig.json",
    cache: true,
    sourceMaps: true,
});

let instruction = fuse.bundle("version-changer").target("browser").instructions(">./index.ts");
if (config.watchMode && !config.productionMode) {
    instruction = instruction.watch();
}
if (config.hotModuleLoading && !config.productionMode) {
    instruction = instruction.hmr();
}
if (config.devServer) {
    fuse.dev({
        open: true,
        root: "public",
    });
}

fuse.run();
