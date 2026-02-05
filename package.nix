{
  lib,
  nodejs,
  bun,
  stdenv,
}:
stdenv.mkDerivation (finalAttrs: {
  pname = "javascript-refresher-Squawkykaka";
  version = "latest";

  src = ./.;

  node_modules = stdenv.mkDerivation {
    inherit (finalAttrs) src version;
    pname = "${finalAttrs.pname}-node_modules";

    nativeBuildInputs = [
      bun
    ];

    dontConfigure = true;
    buildPhase = ''
      runHook preBuild

      export BUN_INSTALL_CACHE_DIR=$(mktemp -d)

      bun install --no-progress --frozen-lockfile --no-cache

      runHook postBuild
    '';

    installPhase = ''
      runHook preInstall

      mkdir -p $out/node_modules
      cp -R ./node_modules $out

      runHook postInstall
    '';

    outputHash =
      {
        x86_64-linux = "sha256-2LMFXemSw4RihbCSJZSqbERcDtYrqtf+Au3bxDbWSZQ=";
        aarch64-linux = "sha256-tZYIiWHaeryV/f9AFNknRZp8om0y8QH8RCxoqgmbR5g=";
      }
      .${stdenv.hostPlatform.system}
        or (throw "${finalAttrs.pname}: Platform ${stdenv.hostPlatform.system} is not packaged yet. Supported platforms: x86_64-linux, aarch64-linux.");
    outputHashMode = "recursive";
  };

  nativeBuildInputs = [
    bun
    nodejs
  ];

  configurePhase = ''
    runHook preConfigure

    cp -R ${finalAttrs.node_modules}/node_modules .

    # Bun takes executables from this folder
    chmod -R u+rw node_modules
    chmod -R u+x node_modules/.bin
    patchShebangs node_modules

    export HOME=$TMPDIR
    export PATH="$PWD/node_modules/.bin:$PATH"

    runHook postConfigure
  '';

  buildPhase = ''
    bun run build
  '';

  installPhase = ''
    mkdir -p $out
    cp -r dist/* $out
  '';
})
