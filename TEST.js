const processContent = (content) =>
  wrapNumbersInDollars(
    removeCurlyBraces2(
      removeNestedCurlyBraces(
        removeSingleCharBraces(
          removeSingleCharBraces(
            removeBracesBeforePrime(
              removeCurlyBraces(
                replaceLeftRight(
                  normalizePunctuation(
                    removeWhitespaceAfterSymbols(
                      replacePercentage(
                        wrapNumbersInDollars(
                          content
                            .trim()
                            .replace(/\s+/g, " "
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
    .replace(/(\$[^$]+\$)/g, (match) =>
      match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
    )
    .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
    .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
      if (p1) {
        // Handle numbers already in $...$
        return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
      }
      if (p2.includes(",")) {
        // Handle decimal numbers with comma
        return "$ " + p2.replace(",", "{,}") + " $";
      }
      return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
    });
