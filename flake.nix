{
  description = "Build a cargo project without extra checks";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    {
      nixpkgs,
      
      ...
    }:
    let
      pkgs = import nixpkgs {
        system = "x86_64-linux";
      };
    in
    {
      devShells."x86_64-linux".default = pkgs.mkShell {
        packages = [
          pkgs.typst
          pkgs.bun
        ];

        buildInputs = [
          pkgs.vips
          pkgs.gcc.cc.lib
        ];

        LD_LIBRARY_PATH = "${pkgs.gcc.cc.lib}/lib";
      };
    };
}
