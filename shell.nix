{pkgs ? import <nixpkgs> {}}: pkgs.mkShell {
        packages = [
          pkgs.typst
          pkgs.tinymist
          pkgs.bun
          pkgs.nodejs
        ];

        buildInputs = [
          pkgs.vips
          pkgs.gcc.cc.lib
        ];

        LD_LIBRARY_PATH = "${pkgs.gcc.cc.lib}/lib";
      }
