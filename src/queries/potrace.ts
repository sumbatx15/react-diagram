import { PosterizerOptions } from "potrace";
import { useMutation, useQuery } from "react-query";
import { posterize } from "potrace";

interface PotraceMutation {
  buffer: string;
  options: PosterizerOptions;
}

export const usePotrace = () => {
  return useMutation({
    mutationFn: async ({ buffer, options }: PotraceMutation) => {
      return new Promise((resolve, reject) => {
        posterize(buffer, options, (err, svg) => {
          if (err) return reject(err);
          resolve(svg);
        });
      });
    },
  });
};
