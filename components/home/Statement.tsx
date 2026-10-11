import PhotoImage from "@/components/PhotoImage";
import { ShotBrief } from "@/components/Shot";
import Figure from "./Figure";
import { IMAGE_NAMES, STATEMENT } from "@/lib/images";

/**
 * A full-width moment between sections: one photograph, one line.
 *
 * The client's filename carried the line — "The network is only as good as
 * who is it" — set here corrected. It sits over the photograph's lower-left on
 * a scrim tied to the text (scrim-statement), checked by the contrast gate
 * against a near-white patch of photograph. No other overlay or treatment on
 * the picture.
 */
export default function Statement() {
  return (
    <section aria-labelledby="statement-line" className="relative bg-crescent-950">
      <Figure>
        <div className="relative min-h-[78svh] md:min-h-[86svh]">
          <PhotoImage
            desktop={STATEMENT.desktop}
            focal={STATEMENT.focal}
            alt={STATEMENT.alt}
            sizes="100vw"
          />
          <ShotBrief name={IMAGE_NAMES.get(STATEMENT) ?? "STATEMENT"} image={STATEMENT} />

          <div className="scrim-statement absolute inset-x-0 bottom-0 pb-14 pt-28 md:pb-20">
            <div className="container-page">
              <h2
                id="statement-line"
                className="type-display max-w-[18ch] text-balance text-white"
              >
                The network is only as good as who is in it.
              </h2>
            </div>
          </div>
        </div>
      </Figure>
    </section>
  );
}
