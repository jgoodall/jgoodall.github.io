
To test locally:

```sh
export JEKYLL_VERSION=4
docker run --rm -p=4000:4000 --volume="$PWD:/srv/jekyll" jekyll/jekyll:$JEKYLL_VERSION jekyll serve
```