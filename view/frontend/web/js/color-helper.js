define([
    'jquery'
], function ($) {
    'use strict';

    function parseToRgba(color) {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);

        const computed = getComputedStyle(div).color;
        document.body.removeChild(div);

        const m = computed.match(/[\d.]+/g).map(Number);
        return {
            r: m[0],
            g: m[1],
            b: m[2],
            a: m[3] ?? 1
        };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;
        const d = max - min;

        if (d === 0) {
            h = s = 0;
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
              case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
              case g: h = ((b - r) / d + 2); break;
              case b: h = ((r - g) / d + 4); break;
            }

            h /= 6;
        }

        return [h, s, l];
    }

    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1/6) return p + (q - p) * 6 * t;
              if (t < 1/2) return q;
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    function adjustLightness(color, delta) {
        const { r, g, b, a } = parseToRgba(color);
        let [h, s, l] = rgbToHsl(r, g, b);

        l = Math.min(1, Math.max(0, l + delta));

        const [nr, ng, nb] = hslToRgb(h, s, l);

        return `rgba(${nr}, ${ng}, ${nb}, ${a})`;
    }

    return {
        getDarken: function (color, percent) {
            return adjustLightness(color, -percent);
        },

        getLighten: function (color, percent) {
            return adjustLightness(color, percent);
        },

        getAltered: function (color, percent) {
            const { r, g, b } = parseToRgba(color);
            const [, , l] = rgbToHsl(r, g, b);

            return l > 0.7
                ? adjustLightness(color, -percent)
                : adjustLightness(color, percent);
        }
    };
});
