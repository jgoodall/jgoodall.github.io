---
layout: post
title: Useful Go Packages
tags:
  - golang
---

Below is a list of packages we use for various projects. [Awesome Go](https://awesome-go.com/) is a great list, but it includes a lot of options. Below are the packages we have standardized on in the [Cyber & Information Security Research Group (CISR)](https://www.ornl.gov/division/csed/cyber-security) at [ORNL](https://www.ornl.gov/).

## Tools

* Editor: [atom](https://atom.io/) with [go-plus](https://atom.io/packages/go-plus)
* Package management: [dep](https://github.com/golang/dep) - dep is the official experiment, but not yet the official tool
* Development/deployment platform: [docker](https://www.docker.com/) with [swarm](https://docs.docker.com/engine/swarm/)

## Packages

* Command line/configuration: [urfave/cli](https://github.com/urfave/cli) - package for building command line apps in Go
* RPC: [gRPC](https://github.com/grpc/grpc-go) - HTTP/2 based RPC
* Serialization: [protobuf](https://github.com/golang/protobuf) and [gogoprotobuf](https://github.com/gogo/protobuf) (for faster marshalling and unmarshalling)
* JSON: [easyjson](github.com/mailru/easyjson) - faster JSON marshalling and unmarshalling
* Logging: [zap](https://github.com/uber-go/zap) or [zerolog](https://github.com/rs/zerolog) - zero allocation logging ([gRPC zap middleware](https://github.com/grpc-ecosystem/go-grpc-middleware/tree/master/logging/zap))
* Performance monitoring: [prometheus](https://github.com/prometheus/prometheus) - metrics and alerting ([gRPC prometheus middleware](https://github.com/grpc-ecosystem/go-grpc-prometheus))
* Diagnostics: [gops](github.com/google/gops)
* Testing: [testify](github.com/stretchr/testify)
* Embedded data store: [badger](https://github.com/dgraph-io/badger) - fast key-value store
* HTTP framework: [echo](https://github.com/labstack/echo)
* Embedding resources: [go.rice](https://github.com/GeertJohan/go.rice)
* Communications: [mangos](https://github.com/go-mangos/mangos) - a pure Go implementation of [nanomsg](http://nanomsg.org/)
* Configuration: [BurntSushi/toml](https://github.com/BurntSushi/toml) - TOML parser
* Console progress bar: [pb](https://github.com/cheggaaa/pb/tree/v2)

## Integrations

* [Elasticsearch](https://www.elastic.co/products/elasticsearch): [elastic](https://github.com/olivere/elastic/)
* [Apache Kafka](https://kafka.apache.org/): [sarama](https://github.com/Shopify/sarama) and [sarama-cluster](https://github.com/bsm/sarama-cluster)
