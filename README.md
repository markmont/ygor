# ABOUT

Ygor is a destop application that provides users of the [Flux High Performance Computing Cluster](http://arc.research.umich.edu/flux-and-other-hpc-resources/flux/) at the University of Michigan a way to get started using Flux without needing to learn Linux first.

Ygor is not intended to provide all of the functionality of Flux, nor to meet the needs of advanced HPC users.  Instead, Ygor is intended to be a set of "training wheels" that researchers can use to quickly and easily get started on Flux.  Unlike other desktop HPC interfaces, Ygor attempts to expose everything that is happening in order to familiarize the researcher with how the cluster works and how to perform various tasks on the cluster.  As the researcher becomes familiar with the cluster, it is anticipated that they will gradually switch to Linux command line environment or a web-based workflow management system.

In particular, Ygor is not a replacement for a workflow management systems such as [Apache Airavata](https://airavata.apache.org/).


# BUILDING

## Cluster

A small amount of code needs to be installed on the cluster for Ygor to work.  This code can be found in the [cluster](https://github.com/markmont/ygor/tree/master/cluster) directory.

Note that the location of the code on the cluster is currently hard-coded into the desktop application.


## Desktop

Currently, the Ygor desktop application is installable on MacOS X and 64-bit Microsoft Windows.  Instructions for compiling the Ygor desktop application from source are available in the files:

* MacOS X: [desktop/doc/setup-mac.md](https://github.com/markmont/ygor/blob/master/desktop/doc/setup-mac.md)
* Microsoft Windows: [desktop/doc/setup-win.md](https://github.com/markmont/ygor/blob/master/desktop/doc/setup-win.md)


# SUPPORT

Please send any questions, feedback, requests, or patches to [lsait-ars-hpc-staff@umich.edu](mailto:lsait-ars-hpc-staff@umich.edu).

Additional resources may be available at [http://github.com/markmont/ygor](http://github.com/markmont/ygor)


# LICENSE

Ygor is Copyright (C) 2015 Regents of The University of Michigan.

Ygor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Ygor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Ygor.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/)

