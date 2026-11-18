import { PropTypes } from "prop-types";

const currentYear = new Date().getFullYear();

const commonLanguages = [
  "English",
  "Bengali",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Chinese",
  "Portuguese",
  "Russian",
];

/**
 * Shared add / update book form. Used by AddBook and UpdateBook so both
 * pages stay visually identical. The five metadata fields (ISBN,
 * publisher, published year, language, pages) are optional; empty ones
 * are left out of the submitted book object.
 */
const BookForm = ({
  initialBook = {},
  categories = [],
  isSubmitting = false,
  submitLabel = "Save Book",
  submittingLabel = "Saving...",
  onSubmit,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.target;
    const book = {
      name: form.bookName.value || "",
      author: form.authorName.value || "",
      quantity: form.bookQuantity.value || "",
      imageUrl: form.bookImageUrl.value || "",
      category: form.bookCategory.value || "",
      rating: form.bookRating.value || "",
      shortDescription: form.bookShortDescription.value || "",
    };

    // Optional metadata: only send fields that have a value.
    const isbn = form.bookIsbn.value.trim();
    if (isbn) book.isbn = isbn;
    const publisher = form.bookPublisher.value.trim();
    if (publisher) book.publisher = publisher;
    const publishedYear = form.bookPublishedYear.value;
    if (publishedYear !== "") book.publishedYear = Number(publishedYear);
    const language = form.bookLanguage.value.trim();
    if (language) book.language = language;
    const pages = form.bookPages.value;
    if (pages !== "") book.pages = Number(pages);

    onSubmit(book);
  };

  return (
    <div className="card bg-base-100 shadow-xl rounded-box max-w-4xl mx-auto">
      <form className="card-body gap-6" onSubmit={handleSubmit}>
        <section>
          <h3 className="text-lg font-semibold playfair border-b border-base-300 pb-2 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Book Name</span>
              </label>
              <input
                type="text"
                placeholder="Book Name"
                defaultValue={initialBook.name || ""}
                className="input input-bordered focus:input-primary"
                name="bookName"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Author Name</span>
              </label>
              <input
                type="text"
                name="authorName"
                placeholder="Author Name"
                defaultValue={initialBook.author || ""}
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Book Category</span>
              </label>
              <select
                className="select select-bordered w-full"
                name="bookCategory"
                defaultValue={initialBook.category || ""}
                required
              >
                <option disabled value="">
                  Pick category
                </option>
                {categories?.map((d) => (
                  <option value={d.name} key={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Book Rating (0 - 10)</span>
              </label>
              <input
                type="number"
                name="bookRating"
                min={0}
                max={10}
                defaultValue={initialBook.rating ?? ""}
                placeholder="Book Rating"
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold playfair border-b border-base-300 pb-2 mb-4">
            Publication Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ISBN{" "}
                  <span className="text-xs opacity-60">(optional)</span>
                </span>
              </label>
              <input
                type="text"
                name="bookIsbn"
                placeholder="e.g. 9780547928227"
                defaultValue={initialBook.isbn || ""}
                className="input input-bordered focus:input-primary"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Publisher{" "}
                  <span className="text-xs opacity-60">(optional)</span>
                </span>
              </label>
              <input
                type="text"
                name="bookPublisher"
                placeholder="e.g. Penguin Books"
                defaultValue={initialBook.publisher || ""}
                className="input input-bordered focus:input-primary"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Published Year{" "}
                  <span className="text-xs opacity-60">(optional)</span>
                </span>
              </label>
              <input
                type="number"
                name="bookPublishedYear"
                min={1000}
                max={currentYear}
                placeholder={`e.g. ${currentYear}`}
                defaultValue={initialBook.publishedYear ?? ""}
                className="input input-bordered focus:input-primary"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Language{" "}
                  <span className="text-xs opacity-60">(optional)</span>
                </span>
              </label>
              <input
                type="text"
                name="bookLanguage"
                list="book-languages"
                placeholder="e.g. English"
                defaultValue={initialBook.language || ""}
                className="input input-bordered focus:input-primary"
              />
              <datalist id="book-languages">
                {commonLanguages.map((lang) => (
                  <option value={lang} key={lang} />
                ))}
              </datalist>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Pages{" "}
                  <span className="text-xs opacity-60">(optional)</span>
                </span>
              </label>
              <input
                type="number"
                name="bookPages"
                min={1}
                placeholder="e.g. 366"
                defaultValue={initialBook.pages ?? ""}
                className="input input-bordered focus:input-primary"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold playfair border-b border-base-300 pb-2 mb-4">
            Cover &amp; Stock
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Book Image Url</span>
              </label>
              <input
                type="text"
                name="bookImageUrl"
                placeholder="Book Image Url"
                defaultValue={initialBook.imageUrl || ""}
                className="input input-bordered focus:input-primary"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Quantity of the book</span>
              </label>
              <input
                type="number"
                placeholder="Quantity of the book"
                defaultValue={initialBook.quantity ?? ""}
                min={0}
                className="input input-bordered focus:input-primary"
                name="bookQuantity"
                required
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold playfair border-b border-base-300 pb-2 mb-4">
            Description
          </h3>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Book Short Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered focus:textarea-primary w-full h-32"
              placeholder="Book Short Description"
              name="bookShortDescription"
              defaultValue={initialBook.shortDescription || ""}
            ></textarea>
          </div>
        </section>

        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </form>
    </div>
  );
};

BookForm.propTypes = {
  initialBook: PropTypes.object,
  categories: PropTypes.array,
  isSubmitting: PropTypes.bool,
  submitLabel: PropTypes.string,
  submittingLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default BookForm;
